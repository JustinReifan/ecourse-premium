<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CallbackController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\WhatsappNotifController;
use App\Http\Controllers\DuitkuCallbackController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::post('/analytics/track', [AnalyticsController::class, 'track'])->name('analytics.track');

Route::post('/send-message', [WhatsappNotifController::class, 'sendMessage']);
Route::post('/callback/{driver}', [CallbackController::class, 'handle'])
    ->name('callback.handle');
