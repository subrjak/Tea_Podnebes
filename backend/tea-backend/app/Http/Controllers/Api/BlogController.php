<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');

        $posts = BlogPost::query()
            ->with('category:id,name,slug')
            ->where('is_published', true)
            ->when($category && $category !== 'all', function ($query) use ($category) {
                $query->whereHas('category', fn ($categoryQuery) => (
                    $categoryQuery->where('slug', $category)
                ));
            })
            ->latest('published_at')
            ->get(['id', 'blog_category_id', 'title', 'slug', 'excerpt', 'image', 'published_at']);

        return response()->json([
            'categories' => BlogCategory::query()
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug']),
            'posts' => $posts,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::query()
            ->with([
                'category:id,name,slug',
                'author:id,name',
                'reviews.user:id,name',
            ])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json($post);
    }
}
