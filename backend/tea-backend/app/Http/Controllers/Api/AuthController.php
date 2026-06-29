<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountEvent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $token = $this->makeToken();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'api_token' => hash('sha256', $token),
            'is_admin' => false,
            'admin_status' => null,
        ]);

        return response()->json([
            'user' => $this->serializeUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Неверный email или пароль.'],
            ]);
        }

        $token = $this->makeToken();
        $user->forceFill([
            'api_token' => hash('sha256', $token),
        ])->save();

        return response()->json([
            'user' => $this->serializeUser($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->serializeUser($this->userFromToken($request)),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->userFromToken($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'profile_phone' => ['nullable', 'string', 'max:50'],
            'profile_telegram' => ['nullable', 'string', 'max:100'],
            'profile_address' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update($validated);

        return response()->json([
            'user' => $this->serializeUser($user->fresh()),
            'message' => 'Профиль обновлен.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $this->userFromToken($request);
        $user->forceFill(['api_token' => null])->save();

        return response()->json([
            'message' => 'Вы вышли из профиля.',
        ]);
    }

    public static function userFromToken(Request $request): User
    {
        $token = $request->bearerToken();

        if (!$token) {
            abort(401, 'Требуется авторизация.');
        }

        $user = User::where('api_token', hash('sha256', $token))->first();

        if (!$user) {
            abort(401, 'Сессия истекла. Войдите снова.');
        }

        return $user;
    }

    private function serializeUser(User $user): array
    {
        $status = $user->customerStatus();
        $statusDiscount = min((int) $status['discount'], 20);
        $eventDiscount = DiscountEvent::activePercent();
        $effectiveDiscount = max($statusDiscount, $eventDiscount);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_phone' => $user->profile_phone,
            'profile_telegram' => $user->profile_telegram,
            'profile_address' => $user->profile_address,
            'is_admin' => $user->is_admin,
            'admin_status' => $user->admin_status,
            'permissions' => [
                'admin' => $user->hasAdminAccess(),
                'inventory' => $user->canManageInventory(),
                'users' => $user->canManageUsers(),
            ],
            'created_at' => $user->created_at,
            'purchased_quantity' => $user->purchasedQuantity(),
            'customer_status' => $status['title'],
            'status_discount_percent' => $statusDiscount,
            'event_discount_percent' => $eventDiscount,
            'effective_discount_percent' => $effectiveDiscount,
            'discount_percent' => $effectiveDiscount,
            'next_status_title' => $status['next_title'],
            'next_status_quantity' => $status['next_quantity'],
        ];
    }

    private function makeToken(): string
    {
        return Str::random(64);
    }
}
