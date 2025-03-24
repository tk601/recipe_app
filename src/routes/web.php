<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // サンプルデータ（後でデータベースから取得する）
    $refrigeratorItems = [
        [
            'id' => 1,
            'name' => '牛乳',
            'quantity' => 1,
            'expiry_date' => '2025-03-30'
        ],
        [
            'id' => 2,
            'name' => '卵',
            'quantity' => 6,
            'expiry_date' => '2025-04-05'
        ],
        [
            'id' => 3,
            'name' => 'ヨーグルト',
            'quantity' => 2,
            'expiry_date' => '2025-03-28'
        ]
    ];
    
    return Inertia::render('Welcome', [
        'refrigeratorItems' => $refrigeratorItems
    ]);
});
