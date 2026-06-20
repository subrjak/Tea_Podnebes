<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\DiscountEvent;
use App\Models\OrderItem;
use App\Models\Tea;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $admin = $this->adminFromToken($request);

        return response()->json([
            'admin' => $admin,
            'roles' => $this->roles(),
            'permissions' => [
                'admin' => $admin->hasAdminAccess(),
                'inventory' => $admin->canManageInventory(),
                'users' => $admin->canManageUsers(),
            ],
            'stats' => [
                'users' => User::count(),
                'admins' => User::query()
                    ->where('is_admin', true)
                    ->orWhereIn('admin_status', [
                        User::ROLE_OWNER,
                        User::ROLE_SENIOR_ADMIN,
                        User::ROLE_ADMIN,
                    ])
                    ->count(),
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
            'image_file' => ['nullable', 'image', 'max:5120'],
            'brewing_temperature' => ['nullable', 'string', 'max:100'],
            'recommended_ware' => ['nullable', 'string', 'max:255'],
        ]);

        $image = $this->resolveTeaImage($request, $validated['image'] ?? null);
        unset($validated['image_file']);

        $tea = Tea::create([
            ...$validated,
            'slug' => $validated['slug'] ?: $this->uniqueTeaSlug($validated['name']),
            'image' => $image,
            'price' => (int) round((float) $validated['price']),
        ]);

        return response()->json([
            'message' => 'Товар добавлен в каталог.',
            'tea' => $tea->load('category:id,name,slug'),
        ], 201);
    }

    public function destroyTea(Request $request, Tea $tea): JsonResponse
    {
        $this->inventoryUserFromToken($request);

        if (OrderItem::where('tea_id', $tea->id)->exists()) {
            abort(422, 'Этот товар уже есть в заказах. Чтобы скрыть его из продаж, поставьте остаток 0.');
        }

        $image = $tea->image;
        $tea->delete();
        $this->deleteStoredTeaImage($image);

        return response()->json([
            'message' => 'Товар удален из каталога.',
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $admin = $this->adminFromToken($request);

        if (!$admin->canManageUsers()) {
            abort(403, 'Управлять ролями могут только Владелец и Старший администратор.');
        }

        return response()->json([
            'roles' => $this->roles(),
            'users' => User::query()
                ->latest()
                ->get(['id', 'name', 'email', 'is_admin', 'admin_status', 'created_at']),
        ]);
    }

    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $admin = $this->adminFromToken($request);

        if (!$admin->canManageUsers()) {
            abort(403, 'Управлять ролями могут только Владелец и Старший администратор.');
        }

        if ($admin->id === $user->id) {
            abort(422, 'Нельзя менять собственную роль.');
        }

        $validated = $request->validate([
            'role' => ['nullable', 'string', Rule::in(array_keys($this->roles()))],
        ]);

        $role = $validated['role'] ?: null;
        $user->forceFill([
            'admin_status' => $role,
            'is_admin' => in_array($role, [
                User::ROLE_OWNER,
                User::ROLE_SENIOR_ADMIN,
                User::ROLE_ADMIN,
            ], true),
        ])->save();

        return response()->json([
            'message' => 'Роль пользователя обновлена.',
            'user' => $user->fresh(),
        ]);
    }

    public function blog(Request $request): JsonResponse
    {
        $this->adminFromToken($request);

        return response()->json([
            'categories' => BlogCategory::query()
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug', 'sort_order']),
            'posts' => BlogPost::query()
                ->with('category:id,name,slug')
                ->latest()
                ->get(['id', 'blog_category_id', 'title', 'slug', 'excerpt', 'content', 'image', 'is_published', 'published_at', 'created_at']),
        ]);
    }

    public function storeBlogPost(Request $request): JsonResponse
    {
        $user = $this->adminFromToken($request);
        $validated = $this->validateBlogPost($request);

        $post = BlogPost::create([
            ...$validated,
            'author_id' => $user->id,
            'slug' => $validated['slug'] ?: $this->uniqueBlogSlug($validated['title']),
            'is_published' => (bool) ($validated['is_published'] ?? true),
            'published_at' => ($validated['is_published'] ?? true) ? now() : null,
        ]);

        return response()->json([
            'message' => 'Статья добавлена.',
            'post' => $post->load('category:id,name,slug'),
        ], 201);
    }

    public function updateBlogPost(Request $request, BlogPost $post): JsonResponse
    {
        $this->adminFromToken($request);
        $validated = $this->validateBlogPost($request, $post);
        $wasPublished = $post->is_published;

        $post->update([
            ...$validated,
            'slug' => $validated['slug'] ?: $post->slug,
            'is_published' => (bool) ($validated['is_published'] ?? true),
            'published_at' => (!$wasPublished && ($validated['is_published'] ?? true)) ? now() : $post->published_at,
        ]);

        return response()->json([
            'message' => 'Статья обновлена.',
            'post' => $post->fresh('category:id,name,slug'),
        ]);
    }

    public function destroyBlogPost(Request $request, BlogPost $post): JsonResponse
    {
        $this->adminFromToken($request);
        $post->delete();

        return response()->json(['message' => 'Статья удалена.']);
    }

    public function discountEvents(Request $request): JsonResponse
    {
        $user = $this->adminFromToken($request);

        if (!$user->canManageUsers()) {
            abort(403, 'Событийные скидки могут устанавливать только Владелец и Старший администратор.');
        }

        return response()->json([
            'events' => DiscountEvent::query()->latest()->get(),
        ]);
    }

    public function storeDiscountEvent(Request $request): JsonResponse
    {
        $user = $this->adminFromToken($request);

        if (!$user->canManageUsers()) {
            abort(403, 'Событийные скидки могут устанавливать только Владелец и Старший администратор.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'discount_percent' => ['required', 'integer', 'min:1', 'max:80'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ]);

        $event = DiscountEvent::create([
            ...$validated,
            'created_by' => $user->id,
            'is_active' => (bool) ($validated['is_active'] ?? false),
        ]);

        return response()->json([
            'message' => 'Событийная скидка создана.',
            'event' => $event,
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

        if (!$user->hasAdminAccess()) {
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

        if (!$user->canManageInventory()) {
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

    private function roles(): array
    {
        return [
            User::ROLE_OWNER => 'Владелец',
            User::ROLE_SENIOR_ADMIN => 'Старший администратор',
            User::ROLE_ADMIN => 'Админ',
            User::ROLE_WAREHOUSE_MANAGER => 'Заведующий складом',
        ];
    }

    private function validateBlogPost(Request $request, ?BlogPost $post = null): array
    {
        return $request->validate([
            'blog_category_id' => ['required', 'integer', 'exists:blog_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('blog_posts', 'slug')->ignore($post?->id),
            ],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string', 'max:20000'],
            'image' => ['nullable', 'string', 'max:1000'],
            'is_published' => ['boolean'],
        ]);
    }

    private function uniqueBlogSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'post-' . Str::lower(Str::random(6));
        $slug = $base;
        $suffix = 2;

        while (BlogPost::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function resolveTeaImage(Request $request, ?string $image): ?string
    {
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('teas', 'public');

            return Storage::url($path);
        }

        return filled($image) ? $image : null;
    }

    private function deleteStoredTeaImage(?string $image): void
    {
        if (!$image || !str_contains($image, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete(Str::after($image, '/storage/'));
    }
}
