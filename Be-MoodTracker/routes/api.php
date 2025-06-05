<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\LifeController;
use App\Http\Controllers\Api\MoodController;


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('api-key')->group(function () {
    Route::apiResource('mood', MoodController::class);
    Route::put('/mood/{id}/status', [MoodController::class, 'updateStatus']);

    Route::apiResource('life', LifeController::class);
    Route::put('/life/{id}/status', [LifeController::class, 'updateStatus']);
});
