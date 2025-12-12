FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL=postgresql://user:password@localhost:5432/bank_management

RUN npx prisma generate

RUN npm run build

EXPOSE 8080
EXPOSE 51212

CMD ["npm", "run", "start"]
