<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TeaController;
use App\Http\Controllers\Api\TelegramWebhookController;

Route::get('/teas', [TeaController::class, 'index']);
Route::get('/teas/{slug}', [TeaController::class, 'show']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::post('/orders', [OrderController::class, 'store']);
Route::post('/telegram/webhook/{secret}', [TelegramWebhookController::class, 'handle']);

Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
