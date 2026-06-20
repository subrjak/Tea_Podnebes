<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Tea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = AuthController::userFromToken($request);

        $validated = $request->validate([
            'type' => ['required', Rule::in(['tea', 'post'])],
            'id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:5', 'max:1200'],
        ]);

        $reviewable = $validated['type'] === 'tea'
            ? Tea::findOrFail($validated['id'])
            : BlogPost::where('is_published', true)->findOrFail($validated['id']);

        $review = $reviewable->reviews()->create([
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'text' => $validated['text'],
        ]);

        return response()->json([
            'message' => 'Отзыв опубликован.',
            'review' => $review->load('user:id,name'),
        ], 201);
    }
}
