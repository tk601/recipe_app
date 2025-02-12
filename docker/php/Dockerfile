FROM php:8.2-fpm

WORKDIR /var/www/html

# PHPの拡張機能インストール
RUN apt-get update && apt-get install -y bash \
    git \
    vim \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# デフォルトシェルを bash に設定
SHELL ["/bin/bash", "-c"]

# Composer のインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ユーザー権限の設定
RUN chown -R www-data:www-data /var/www/html
