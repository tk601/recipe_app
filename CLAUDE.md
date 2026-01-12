# プロジェクト概要
新規開発中のレシピ管理アプリケーション「ごはんどき（gohandoki）」

## claude codeで作成されるコードについて
- わかりやすいように日本語でコメントを追加してください
- デザインはTailwind CSSとDaisyUIを使用してください
- デザインはモバイルが優先ですが、デスクトップでも見やすいようにしてください
- デザインは統一感を持たせてください
- デザインの色の参考は「src/resources/css/app.css」を参照してください

## 技術スタック
### バックエンド
- **Laravel**: 12.x（PHP 8.4）
- **データベース**: MySQL 8.0
- **認証**: Laravel Breeze + Laravel Socialite (LINE連携)

### フロントエンド
- **React**: 18.2
- **Inertia.js**: 2.0
- **TypeScript**: 5.0
- **スタイリング**:
  - Tailwind CSS 3.4
  - DaisyUI 4.12
- **ビルドツール**: Vite 6.0
- **アイコン**: lucide-react

### インフラ
- **Docker Compose**: 開発環境
  - PHP 8.4-FPM
  - Nginx (Alpine)
  - MySQL 8.0
  - phpMyAdmin
- **Node.js**: 20.x

## プロジェクト構造

```
new_recipe_app/
├── docker/                    # Docker設定
│   ├── php/                   # PHP-FPM Dockerfile
│   ├── nginx/                 # Nginx設定
│   └── mysql/                 # MySQLデータ・ログ
├── src/                       # Laravelアプリケーション
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/      # 認証関連（LINE連携含む）
│   │   │   │   ├── ingredientController.php
│   │   │   │   └── ProfileController.php
│   │   │   └── Middleware/
│   │   │       └── HandleInertiaRequests.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Recipe.php
│   │       ├── Ingredient.php
│   │       ├── IngredientCategory.php
│   │       ├── RecipeIngredient.php
│   │       ├── RecipeInstruction.php
│   │       ├── RecipeCategory.php
│   │       ├── Refrigerator.php
│   │       ├── ShoppingList.php
│   │       ├── Good.php
│   │       └── SharedRecipe.php
│   ├── database/
│   │   ├── migrations/        # DBマイグレーション
│   │   └── seeders/
│   │       ├── IngredientCategoriesSeeder.php
│   │       └── IngredientsSeeder.php
│   ├── resources/
│   │   ├── js/
│   │   │   ├── Components/
│   │   │   │   └── Mobile/    # モバイル用コンポーネント
│   │   │   ├── Layouts/
│   │   │   │   ├── AuthenticatedLayout.tsx
│   │   │   │   └── GuestLayout.tsx
│   │   │   ├── Pages/
│   │   │   │   ├── Auth/      # 認証画面
│   │   │   │   │   └── Login.tsx
│   │   │   │   ├── Mobile/    # モバイル専用ページ
│   │   │   │   │   ├── MobileMain.tsx
│   │   │   │   │   ├── Recipe.tsx
│   │   │   │   │   ├── Refrigerators.tsx
│   │   │   │   │   ├── ShoppingLists.tsx
│   │   │   │   │   └── ProfilePage.tsx
│   │   │   │   ├── Desktop/   # デスクトップ専用ページ
│   │   │   │   │   └── DesktopMain.tsx
│   │   │   │   ├── Ingredients/
│   │   │   │   │   └── Index.tsx
│   │   │   │   ├── Profile/
│   │   │   │   └── Welcome.tsx
│   │   │   └── app.tsx        # Inertiaエントリーポイント
│   │   └── css/
│   │       └── app.css        # Tailwind設定
│   ├── routes/
│   │   ├── web.php            # Webルート定義
│   │   └── auth.php           # 認証ルート
│   ├── composer.json
│   ├── package.json
│   └── tailwind.config.js     # DaisyUI設定含む
├── docker-compose.yml
└── README.md
```

## データベースモデル
### 主要モデルとリレーション
- **User**: ユーザー
- **Recipe**: レシピ
  - hasMany: RecipeIngredient, RecipeInstruction, Good, SharedRecipe
  - belongsTo: RecipeCategory
- **Ingredient**: 材料マスタ
  - belongsTo: IngredientCategory
- **IngredientCategory**: 材料カテゴリ
- **RecipeIngredient**: レシピと材料の中間テーブル
- **RecipeInstruction**: レシピの手順
- **Refrigerator**: ユーザーの冷蔵庫在庫
- **ShoppingList**: 買い物リスト
- **Good**: レシピへのいいね
- **SharedRecipe**: レシピの共有

## アプリケーションの機能詳細
### 食材管理
- 食材の登録・編集・削除
- 食材の検索
- 食材のカテゴリ管理
- 食材の在庫管理

### レシピ管理
- レシピの作成・編集・削除
- レシピカテゴリ
- レシピの共有機能
- いいね機能
- レシピで使用する食材の確認

### 買い物リスト
- 買い物リストの作成・管理

### ユーザー情報
- プロフィール画像の設定
- ユーザー名の設定
- メールアドレスの設定
- パスワードの再設定

### ログイン
- メール＋パスワードでログイン
- Googleでログイン
- LINEでログイン

## 開発環境のセットアップ

### 初回セットアップ
```bash
# Dockerコンテナの起動
docker-compose up -d

# コンテナに入る
docker exec -it new_recipe_app-app-1 bash

# Laravel依存関係のインストール
composer install

# フロントエンド依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
php artisan key:generate

# データベースマイグレーション
php artisan migrate

# シーダーの実行
php artisan db:seed

# フロントエンドの開発サーバー起動
npm run dev
```

### 起動方法
```bash
# Dockerコンテナ起動
docker-compose up -d

# コンテナに入る
docker exec -it new_recipe_app-app-1 bash

# フロントエンド開発サーバー
npm run dev

# アプリケーションURL
http://localhost:8000
```

### 利用可能なポート
- **8000**: Nginx（Laravel アプリケーション）
- **3306**: MySQL
- **8080**: phpMyAdmin
- **5173**: Vite開発サーバー

## コーディング規約

### PHP/Laravel
- PSR-12準拠（Laravel Pint使用）
- コントローラー名: PascalCase（例: `IngredientController`）
- モデル名: 単数形PascalCase（例: `Recipe`, `Ingredient`）
- ルート名: ケバブケース（例: `ingredients.index`）

### TypeScript/React
- コンポーネント: PascalCase（例: `MobileMain.tsx`）
- 関数: camelCase
- 型定義: interface優先
- Inertia.jsの型定義を活用

### スタイリング
- Tailwind CSSのユーティリティクラス優先
- DaisyUIコンポーネント活用
- レスポンシブ対応（モバイルファースト）
- テーマ: light/dark対応

## 認証とセキュリティ

### LINE Social Login設定
環境変数に以下を設定:
```env
LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_client_secret
LINE_REDIRECT_URI=http://localhost:8000/auth/line/callback
```

### CSRF保護
- Inertia.jsが自動的にCSRFトークンを処理
- フォーム送信時は自動的に保護

## 開発Tips

### Inertia.jsの使い方
```php
// コントローラー内
return Inertia::render('ComponentName', [
    'propName' => $data
]);
```

```tsx
// Reactコンポーネント内
import { router } from '@inertiajs/react';

// ページ遷移
router.visit('/path');

// フォーム送信
router.post('/path', data);
```

### Ziggyルーティング
```tsx
// TypeScriptでLaravelルートを使用
import { route } from 'ziggy-js';

router.visit(route('ingredients.index'));
```

### DaisyUIコンポーネント
```tsx
// ボタン例
<button className="btn btn-primary">送信</button>

// カード例
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">...</div>
</div>
```

## トラブルシューティング

### Viteが接続できない場合
- docker-compose.ymlで5173ポートが公開されているか確認
- コンテナ内で`npm run dev`が実行されているか確認

### データベース接続エラー
- `.env`のDB設定を確認
- docker-composeでMySQLコンテナが起動しているか確認

### Composerエラー
- PHPバージョンが8.4であることを確認
- `composer update`を実行して依存関係を更新

## Git管理

### 現在のブランチ
- main: `dev`

### コミット前のチェック
- Laravel Pint: `./vendor/bin/pint`
- TypeScriptビルド: `npm run build`
- マイグレーションのロールバック可能性確認

## 今後の開発予定

- [ ] レシピ検索機能
- [ ] 賞味期限管理・通知
- [ ] レシピの材料からの自動提案
- [ ] 買い物リストとレシピの連携
- [ ] レシピの画像アップロード
- [ ] ユーザー間のレシピ共有機能の拡充
- [ ] PWA対応

## 参考資料

- [Laravel 12 ドキュメント](https://laravel.com/docs/12.x)
- [Inertia.js ドキュメント](https://inertiajs.com/)
- [React 18 ドキュメント](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Laravel Socialite](https://laravel.com/docs/12.x/socialite)
