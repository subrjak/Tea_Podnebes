<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Tea;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
