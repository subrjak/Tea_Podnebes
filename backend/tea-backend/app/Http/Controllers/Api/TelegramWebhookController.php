<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\TelegramOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, string $secret, TelegramOrderService $telegram): JsonResponse
    {
        if (!hash_equals((string) config('services.telegram.webhook_secret'), $secret)) {
            abort(403);
        }

        $callback = $request->input('callback_query');
        $data = $callback['data'] ?? '';

        if (!str_starts_with($data, 'order:')) {
            return response()->json(['ok' => true]);
        }

        if (!$this->isAllowedChat($callback)) {
            $telegram->answerCallback($callback['id'] ?? '', 'Этот чат не подключен к обработке заказов');

            return response()->json(['ok' => true]);
        }

        $parts = explode(':', $data);

        if (count($parts) !== 3) {
            Log::warning('Invalid Telegram callback data', ['data' => $data]);

            return response()->json(['ok' => true]);
        }

        [, $action, $orderId] = $parts;
        $order = Order::find($orderId);

        if (!$order) {
            $telegram->answerCallback($callback['id'] ?? '', 'Заказ не найден');

            return response()->json(['ok' => true]);
        }

        if (!in_array($action, ['confirm', 'reject', 'paid'], true)) {
            Log::warning('Unknown Telegram order action', [
                'action' => $action,
                'order_id' => $order->id,
            ]);

            $telegram->answerCallback($callback['id'] ?? '', 'Неизвестное действие');

            return response()->json(['ok' => true]);
        }

        match ($action) {
            'confirm' => $order->forceFill([
                'status' => Order::STATUS_CONFIRMED,
            ])->save(),
            'reject' => $order->forceFill([
                'status' => Order::STATUS_REJECTED,
                'payment_status' => $order->payment_status === 'paid' ? 'paid' : 'canceled',
            ])->save(),
            'paid' => $order->forceFill([
                'status' => Order::STATUS_PAID,
                'payment_status' => 'paid',
            ])->save(),
        };

        $telegram->answerCallback($callback['id'] ?? '', "Заказ #{$order->order_number} обновлен");
        $telegram->editOrderMessage($order->fresh('items'));

        return response()->json(['ok' => true]);
    }

    private function isAllowedChat(array $callback): bool
    {
        $allowedChatId = (string) config('services.telegram.chat_id');
        $actualChatId = (string) data_get($callback, 'message.chat.id', '');

        return blank($allowedChatId) || hash_equals($allowedChatId, $actualChatId);
    }
}
