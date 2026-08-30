FROM node:24

WORKDIR /app

COPY package*.json .

RUN npm install

COPY prisma ./prisma

COPY . .

RUN npx prisma generate

EXPOSE 3030

RUN npm install -g nodemon ts-node

CMD ["npm", "run", "dev"]