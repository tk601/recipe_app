import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            buildDirectory: 'build',
        }),
        react({
            // バベルプラグインの明示的な設定
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost',
            protocol: 'ws',
        },
    },
    build: {
        outDir: 'public/build', // ビルド出力ディレクトリを明示的に指定
        manifest: true, // マニフェストファイルを生成
    },
});
