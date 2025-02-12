FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# web-vitalsを事前にインストール
RUN npm install axios web-vitals

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
