FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
