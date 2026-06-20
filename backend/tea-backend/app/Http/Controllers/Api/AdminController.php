<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Tea;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $admin = $this->adminFromToken($request);

        return response()->json([
            'admin' => $admin,
            'stats' => [
                'users' => User::count(),
                'admins' => User::where('is_admin', true)->count(),
                'teas' => Tea::count(),
                'categories' => Category::count(),
            ],
            'recent_users' => User::query()
                ->latest()
                ->take(6)
                ->get(['id', 'name', 'email', 'is_admin', 'admin_status', 'created_at']),
            'low_stock_teas' => Tea::query()
                ->with('category:id,name')
                ->orderBy('stock')
                ->take(6)
                ->get(['id', 'name', 'slug', 'stock', 'price', 'category_id']),
        ]);
    }

    public function teas(Request $request): JsonResponse
    {
        $this->inventoryUserFromToken($request);

        return response()->json([
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'teas' => Tea::query()
                ->with('category:id,name,slug')
                ->latest()
                ->take(30)
                ->get([
                    'id',
                    'category_id',
                    'name',
                    'slug',
                    'origin',
                    'age',
                    'price',
                    'stock',
                    'image',
                    'brewing_temperature',
                    'recommended_ware',
                    'created_at',
                ]),
        ]);
    }

    public function storeTea(Request $request): JsonResponse
    {
        $this->inventoryUserFromToken($request);

        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('teas', 'slug')],
            'description' => ['nullable', 'string', 'max:6000'],
            'origin' => ['required', 'string', 'max:255'],
            'age' => ['required', 'integer', 'min:0', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'stock' => ['required', 'integer', 'min:0', 'max:999999'],
            'image' => ['nullable', 'string', 'max:1000'],
            'brewing_temperature' => ['nullable', 'string', 'max:100'],
            'recommended_ware' => ['nullable', 'string', 'max:255'],
        ]);

        $tea = Tea::create([
            ...$validated,
            'slug' => $validated['slug'] ?: $this->uniqueTeaSlug($validated['name']),
            'image' => filled($validated['image'] ?? null) ? $validated['image'] : null,
            'price' => (int) round((float) $validated['price']),
        ]);

        return response()->json([
            'message' => 'Товар добавлен в каталог.',
            'tea' => $tea->load('category:id,name,slug'),
        ], 201);
    }

    private function adminFromToken(Request $request): User
    {
        $token = $request->bearerToken();

        if (!$token) {
            abort(401, 'Требуется авторизация.');
        }

        $user = User::where('api_token', hash('sha256', $token))->first();

        if (!$user) {
            abort(401, 'Сессия истекла. Войдите снова.');
        }

        if (!$user->is_admin) {
            abort(403, 'Недостаточно прав для админ-панели.');
        }

        return $user;
    }

    private function inventoryUserFromToken(Request $request): User
    {
        $token = $request->bearerToken();

        if (!$token) {
            abort(401, 'Требуется авторизация.');
        }

        $user = User::where('api_token', hash('sha256', $token))->first();

        if (!$user) {
            abort(401, 'Сессия истекла. Войдите снова.');
        }

        $status = Str::lower((string) $user->admin_status);

        if (!Str::contains($status, ['админ', 'заведующий складом'])) {
            abort(403, 'Добавлять товары могут только Админ и Заведующий складом.');
        }

        return $user;
    }

    private function uniqueTeaSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'tea-' . Str::lower(Str::random(6));
        $slug = $base;
        $suffix = 2;

        while (Tea::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
