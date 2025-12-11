FROM node:24-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 8080
EXPOSE 51212

CMD ["npm", "run", "start"]
