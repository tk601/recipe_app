FROM php:8.2-fpm

WORKDIR /var/www/backend

# 必要なパッケージとPHP拡張機能をインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# PHP拡張機能をインストール
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Laravel用の設定
COPY . .
# Composer のインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# アプリケーションの権限を設定
RUN chown -R www-data:www-data /var/www/backend
# RUN chmod -R 755 /var/www/backend/storage

# 8000番ポートを公開
EXPOSE 8000

# Laravelを起動
CMD php artisan serve --host=0.0.0.0 --port=8000
