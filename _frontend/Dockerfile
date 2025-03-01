FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# web-vitalsを事前にインストール
RUN npm install axios web-vitals

# Tailwind CSSのインストール
RUN npm install -D tailwindcss postcss autoprefixer

# Tailwind CSSの初期化
RUN npx tailwindcss init -p

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
