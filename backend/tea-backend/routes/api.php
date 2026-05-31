<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TeaController;

Route::get('/teas', [TeaController::class, 'index']);
Route::get('/teas/{slug}', [TeaController::class, 'show']);