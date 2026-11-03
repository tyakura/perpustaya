<?php

use App\Http\Controllers\BookController;
use Illuminate\Support\Facades\Route;

Route::get('halo', function () {
    return response()->json(['message' => 'halo']);
});

Route::get('/hello/{name}', fn($name) =>
  response()->json(['message' => "Halo, $name!"]));

Route::apiResource('books', BookController::class)
    ->only(['index', 'show', 'store', 'update', 'destroy']);
