<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Tea;
use App\Services\TelegramOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function store(Request $request, TelegramOrderService $telegram): JsonResponse
    {
        $validated = $request->validate([
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:50'],
            'customer.telegram' => ['nullable', 'string', 'max:100'],
            'customer.address' => ['nullable', 'string', 'max:1000'],
            'customer.comment' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', Rule::in([Order::PAYMENT_QR, Order::PAYMENT_CASH])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:teas,id'],
            'items.*.weight' => ['required', 'integer', Rule::in([25, 50, 100, 200, 357])],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $order = DB::transaction(function () use ($validated) {
            $teas = Tea::query()
                ->with('category:id,name')
                ->whereIn('id', collect($validated['items'])->pluck('id'))
                ->get()
                ->keyBy('id');

            $items = collect($validated['items'])->map(function ($cartItem) use ($teas) {
                $tea = $teas->get($cartItem['id']);
                $weight = (int) $cartItem['weight'];
                $quantity = (int) $cartItem['quantity'];
                $unitPrice = (int) $tea->price;
                $linePrice = (int) round($unitPrice * ($weight / 100));

                return [
                    'tea_id' => $tea->id,
                    'tea_name' => $tea->name,
                    'tea_slug' => $tea->slug,
                    'category_name' => $tea->category?->name,
                    'weight' => $weight,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_price' => $linePrice,
                    'total_price' => $linePrice * $quantity,
                ];
            });

            $order = Order::create([
                'order_number' => now()->format('ymd') . '-' . Str::upper(Str::random(5)),
                'customer_name' => $validated['customer']['name'],
                'customer_phone' => $validated['customer']['phone'],
                'customer_telegram' => $validated['customer']['telegram'] ?? null,
                'delivery_address' => $validated['customer']['address'] ?? null,
                'comment' => $validated['customer']['comment'] ?? null,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === Order::PAYMENT_QR ? 'pending' : 'cash_on_delivery',
                'status' => Order::STATUS_PENDING,
                'total_weight' => $items->sum(fn ($item) => $item['weight'] * $item['quantity']),
                'total_quantity' => $items->sum('quantity'),
                'total_price' => $items->sum('total_price'),
            ]);

            $order->items()->createMany($items->all());

            return $order->load('items');
        });

        $messageId = $telegram->sendOrder($order);

        if ($messageId) {
            $order->forceFill(['telegram_message_id' => $messageId])->save();
        }

        return response()->json([
            'order' => $order->fresh('items'),
            'telegram_sent' => filled($messageId),
        ], 201);
    }
}
