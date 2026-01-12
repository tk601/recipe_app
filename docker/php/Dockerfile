FROM php:8.4-fpm

# NodeJSとnpmのインストール
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get update && apt-get install -y nodejs

# システム依存パッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    bash \
    && rm -rf /var/lib/apt/lists/*

# デフォルトシェルを bash に設定
ENV SHELL=/bin/bash

# キャッシュクリア
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# PHP拡張機能のインストール
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# PHPのアップロード設定を5MBに制限
RUN echo "upload_max_filesize = 5M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 5M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_input_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini

# Composerの取得
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリの設定
WORKDIR /var/www/html
