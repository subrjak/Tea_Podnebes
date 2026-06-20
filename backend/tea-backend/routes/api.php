<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TeaController;
use App\Http\Controllers\Api\TelegramWebhookController;

Route::get('/teas', [TeaController::class, 'index']);
Route::get('/teas/{slug}', [TeaController::class, 'show']);
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/me', [AuthController::class, 'me']);
Route::put('/profile', [AuthController::class, 'updateProfile']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/favorites', [FavoriteController::class, 'index']);
Route::post('/favorites/{tea}', [FavoriteController::class, 'store']);
Route::delete('/favorites/{tea}', [FavoriteController::class, 'destroy']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::post('/telegram/webhook/{secret}', [TelegramWebhookController::class, 'handle']);

Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
Route::get('/admin/teas', [AdminController::class, 'teas']);
Route::post('/admin/teas', [AdminController::class, 'storeTea']);
Route::delete('/admin/teas/{tea}', [AdminController::class, 'destroyTea']);
Route::get('/admin/users', [AdminController::class, 'users']);
Route::put('/admin/users/{user}/role', [AdminController::class, 'updateUserRole']);
Route::get('/admin/blog', [AdminController::class, 'blog']);
Route::post('/admin/blog', [AdminController::class, 'storeBlogPost']);
Route::put('/admin/blog/{post}', [AdminController::class, 'updateBlogPost']);
Route::delete('/admin/blog/{post}', [AdminController::class, 'destroyBlogPost']);
Route::get('/admin/discount-events', [AdminController::class, 'discountEvents']);
Route::post('/admin/discount-events', [AdminController::class, 'storeDiscountEvent']);
Route::get('/ping', function () {
    return response()->json(['pong' => true]);
});
