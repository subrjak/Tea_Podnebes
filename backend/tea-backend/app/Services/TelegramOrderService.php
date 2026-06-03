<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramOrderService
{
    public function sendOrder(Order $order): ?string
    {
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $response = Http::post($this->apiUrl('sendMessage'), [
                'chat_id' => $this->chatId(),
                'text' => $this->buildOrderText($order),
                'parse_mode' => 'HTML',
                'reply_markup' => $this->buildOrderKeyboard($order),
            ]);

            if (!$response->successful()) {
                Log::warning('Telegram order notification failed', [
                    'order_id' => $order->id,
                    'response' => $response->json(),
                ]);

                return null;
            }

            return (string) $response->json('result.message_id');
        } catch (\Throwable $exception) {
            Log::warning('Telegram order notification exception', [
                'order_id' => $order->id,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    public function answerCallback(string $callbackQueryId, string $text): void
    {
        if (!$this->isConfigured()) {
            return;
        }

        Http::post($this->apiUrl('answerCallbackQuery'), [
            'callback_query_id' => $callbackQueryId,
            'text' => $text,
        ]);
    }

    public function editOrderMessage(Order $order): void
    {
        if (!$this->isConfigured() || !$order->telegram_message_id) {
            return;
        }

        Http::post($this->apiUrl('editMessageText'), [
            'chat_id' => $this->chatId(),
            'message_id' => $order->telegram_message_id,
            'text' => $this->buildOrderText($order),
            'parse_mode' => 'HTML',
            'reply_markup' => $this->buildOrderKeyboard($order),
        ]);
    }

    private function buildOrderText(Order $order): string
    {
        $order->loadMissing('items');

        $paymentMethod = $order->payment_method === Order::PAYMENT_QR
            ? 'QR на сайте'
            : 'Наличными при получении';

        $status = match ($order->status) {
            Order::STATUS_CONFIRMED => 'Подтвержден',
            Order::STATUS_REJECTED => 'Отклонен',
            Order::STATUS_PAID => 'Оплачен',
            default => 'Ожидает подтверждения',
        };

        $items = $order->items
            ->map(fn ($item) => sprintf(
                "• %s, %d г x%d — %s ₸",
                e($item->tea_name),
                $item->weight,
                $item->quantity,
                number_format($item->total_price, 0, '.', ' ')
            ))
            ->implode("\n");

        return implode("\n", array_filter([
            "<b>Новый заказ #{$order->order_number}</b>",
            "Статус: <b>{$status}</b>",
            "Оплата: {$paymentMethod}",
            '',
            "<b>Клиент</b>",
            'Имя: ' . e($order->customer_name),
            'Телефон: ' . e($order->customer_phone),
            $order->customer_telegram ? 'Telegram: ' . e($order->customer_telegram) : null,
            $order->delivery_address ? 'Адрес: ' . e($order->delivery_address) : null,
            $order->comment ? 'Комментарий: ' . e($order->comment) : null,
            '',
            "<b>Товары</b>",
            $items,
            '',
            "Вес: {$order->total_weight} г",
            'Сумма: <b>' . number_format($order->total_price, 0, '.', ' ') . ' ₸</b>',
        ], fn ($line) => $line !== null));
    }

    private function buildOrderKeyboard(Order $order): array
    {
        return [
            'inline_keyboard' => [
                [
                    ['text' => 'Принять', 'callback_data' => "order:confirm:{$order->id}"],
                    ['text' => 'Отклонить', 'callback_data' => "order:reject:{$order->id}"],
                ],
                [
                    ['text' => 'Оплачен', 'callback_data' => "order:paid:{$order->id}"],
                ],
            ],
        ];
    }

    private function isConfigured(): bool
    {
        return filled($this->token()) && filled($this->chatId());
    }

    private function apiUrl(string $method): string
    {
        return "https://api.telegram.org/bot{$this->token()}/{$method}";
    }

    private function token(): ?string
    {
        return config('services.telegram.bot_token');
    }

    private function chatId(): ?string
    {
        return config('services.telegram.chat_id');
    }
}
