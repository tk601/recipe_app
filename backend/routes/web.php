<?php

use App\Models\Good;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/items', function () {
    return response()->json(Good::all());
});
