FROM node:20

WORKDIR /app

COPY package*.json .

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 3030

RUN npm install -g nodemon ts-node

RUN npm run build

CMD ["nodemon", "src/index.ts"]