FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/db/prisma ./packages/db/prisma

RUN npm install

COPY tsconfig.base.json ./tsconfig.base.json
COPY packages/db ./packages/db
COPY apps/api ./apps/api

RUN npm run db:generate -w @spopi/db
RUN npm run build -w @spopi/db
RUN npm run build -w @spopi/api

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma && npm run start -w @spopi/api"]