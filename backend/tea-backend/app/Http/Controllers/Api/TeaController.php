<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Tea;
use Illuminate\Http\Request;

class TeaController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:80'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 12);
        $search = trim((string) ($validated['search'] ?? ''));

        $teas = Tea::query()
            ->with('category:id,name,slug')
            ->select('id', 'name', 'slug', 'price', 'stock', 'image', 'category_id')
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(($validated['category'] ?? null) && $validated['category'] !== 'all', function ($query) use ($validated) {
                $query->whereHas('category', fn ($categoryQuery) => (
                    $categoryQuery->where('slug', $validated['category'])
                ));
            })
            ->when(isset($validated['max_price']), function ($query) use ($validated) {
                $query->where('price', '<=', $validated['max_price']);
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => $teas->items(),
            'meta' => [
                'current_page' => $teas->currentPage(),
                'from' => $teas->firstItem(),
                'last_page' => $teas->lastPage(),
                'per_page' => $teas->perPage(),
                'to' => $teas->lastItem(),
                'total' => $teas->total(),
                'max_price' => (int) Tea::max('price'),
                'categories' => Category::query()
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
            ],
        ]);
    }

    // Детальная информация
    public function show($slug)
    {
        $tea = Tea::where('slug', $slug)
            ->with('category:id,name,slug')
            ->firstOrFail();
        return response()->json($tea);
    }
}
