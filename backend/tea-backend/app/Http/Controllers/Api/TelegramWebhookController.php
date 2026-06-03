<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\TelegramOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, string $secret, TelegramOrderService $telegram): JsonResponse
    {
        if ($secret !== config('services.telegram.webhook_secret')) {
            abort(403);
        }

        $callback = $request->input('callback_query');
        $data = $callback['data'] ?? '';

        if (!str_starts_with($data, 'order:')) {
            return response()->json(['ok' => true]);
        }

        [, $action, $orderId] = explode(':', $data) + [null, null, null];
        $order = Order::findOrFail($orderId);

        match ($action) {
            'confirm' => $order->forceFill(['status' => Order::STATUS_CONFIRMED])->save(),
            'reject' => $order->forceFill(['status' => Order::STATUS_REJECTED])->save(),
            'paid' => $order->forceFill([
                'status' => Order::STATUS_PAID,
                'payment_status' => 'paid',
            ])->save(),
            default => null,
        };

        $telegram->answerCallback($callback['id'] ?? '', "Заказ #{$order->order_number} обновлен");
        $telegram->editOrderMessage($order->fresh('items'));

        return response()->json(['ok' => true]);
    }
}
