<?php

use App\Models\Good;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiTest;

Route::get('/test', function () {
    return response()->json(Good::all());
});

Route::apiResource('/sample', ApiTest::class);//追記
