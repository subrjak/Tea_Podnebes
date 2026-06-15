<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = AuthController::userFromToken($request);

        $teas = $user->favoriteTeas()
            ->with('category:id,name,slug')
            ->select('teas.id', 'name', 'slug', 'price', 'stock', 'image', 'category_id')
            ->latest('favorite_tea_user.created_at')
            ->get();

        return response()->json([
            'favorites' => $teas,
            'ids' => $teas->pluck('id')->values(),
        ]);
    }

    public function store(Request $request, Tea $tea): JsonResponse
    {
        $user = AuthController::userFromToken($request);
        $user->favoriteTeas()->syncWithoutDetaching([$tea->id]);

        return response()->json([
            'message' => 'Товар добавлен в избранное.',
            'tea_id' => $tea->id,
        ], 201);
    }

    public function destroy(Request $request, Tea $tea): JsonResponse
    {
        $user = AuthController::userFromToken($request);
        $user->favoriteTeas()->detach($tea->id);

        return response()->json([
            'message' => 'Товар удален из избранного.',
            'tea_id' => $tea->id,
        ]);
    }
}
