<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::apiResource('/sample', ApiTest::class);//追記

Route::get('/test', function () {
    return response()->json(['message' => 'hello takato']);
});
