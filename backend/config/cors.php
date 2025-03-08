<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // CORSの有効化
    'paths' => ['api/*'],

    // 許可するHTTPメソッド
    'allowed_methods' => ['*'],

    // 許可するオリジン（本番環境では適切に設定すること）
    'allowed_origins' => ['http://localhost'],

    // 許可するヘッダー
    'allowed_headers' => ['*'],

    // レスポンスで公開するヘッダー
    'exposed_headers' => [],

    // 認証情報を含めるかどうか
    'supports_credentials' => true,

    // プリフライトリクエストのキャッシュ時間（秒）
    'max_age' => 0,
];
