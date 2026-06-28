<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\AuthController;
use App\Models\DiscountEvent;
use App\Models\Order;
use App\Models\Tea;
use App\Services\TelegramOrderService;
use App\Support\CustomerStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const DELIVERY_PRICE = 1000;
    private const FREE_DELIVERY_THRESHOLD = 6000;

    public function store(Request $request, TelegramOrderService $telegram): JsonResponse
    {
        $user = AuthController::userFromToken($request);

        $validated = $request->validate([
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.phone' => ['nullable', 'string', 'max:50'],
            'customer.telegram' => ['nullable', 'string', 'max:100'],
            'customer.address' => ['nullable', 'string', 'max:1000'],
            'customer.comment' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', Rule::in([Order::PAYMENT_QR, Order::PAYMENT_CASH])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:teas,id'],
            'items.*.weight' => ['required', 'integer', Rule::in([5, 10, 15, 25, 50, 100, 200, 357])],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $customer = [
            'name' => $validated['customer']['name'] ?: $user->name,
            'phone' => ($validated['customer']['phone'] ?? null) ?: $user->profile_phone,
            'telegram' => $validated['customer']['telegram'] ?? $user->profile_telegram,
            'address' => $validated['customer']['address'] ?? $user->profile_address,
            'comment' => $validated['customer']['comment'] ?? null,
        ];

        if (!filled($customer['phone']) || !filled($customer['address'])) {
            throw ValidationException::withMessages([
                'customer' => ['Заполните телефон и адрес в профиле или форме заказа.'],
            ]);
        }

        $order = DB::transaction(function () use ($validated, $customer, $user) {
            $teas = Tea::query()
                ->with('category:id,name')
                ->whereIn('id', collect($validated['items'])->pluck('id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $requestedByTea = collect($validated['items'])
                ->groupBy('id')
                ->map(fn ($items) => $items->sum('quantity'));

            foreach ($requestedByTea as $teaId => $quantity) {
                $tea = $teas->get((int) $teaId);

                if (!$tea || $tea->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Недостаточно товара «{$tea?->name}» на складе."],
                    ]);
                }
            }

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

            $subtotalPrice = $items->sum('total_price');
            $status = CustomerStatus::fromQuantity($user->purchasedQuantity());
            $statusDiscount = min((int) $status['discount'], 20);
            $eventDiscount = (int) DiscountEvent::query()
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                })
                ->max('discount_percent');
            $discountPercent = max($statusDiscount, $eventDiscount);
            $productsTotal = (int) round($subtotalPrice * (100 - $discountPercent) / 100);
            $deliveryPrice = $productsTotal >= self::FREE_DELIVERY_THRESHOLD ? 0 : self::DELIVERY_PRICE;
            $totalPrice = $productsTotal + $deliveryPrice;

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => now()->format('ymd') . '-' . Str::upper(Str::random(5)),
                'customer_name' => $customer['name'],
                'customer_phone' => $customer['phone'],
                'customer_telegram' => $customer['telegram'],
                'delivery_address' => $customer['address'],
                'comment' => $customer['comment'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === Order::PAYMENT_QR ? 'pending' : 'cash_on_delivery',
                'status' => Order::STATUS_PENDING,
                'total_weight' => $items->sum(fn ($item) => $item['weight'] * $item['quantity']),
                'total_quantity' => $items->sum('quantity'),
                'discount_percent' => $discountPercent,
                'subtotal_price' => $subtotalPrice,
                'total_price' => $totalPrice,
            ]);

            $order->items()->createMany($items->all());

            foreach ($requestedByTea as $teaId => $quantity) {
                $teas->get((int) $teaId)->decrement('stock', (int) $quantity);
            }

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

    public function index(Request $request): JsonResponse
    {
        $user = AuthController::userFromToken($request);

        $orders = $user->orders()
            ->with('items')
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }
}
