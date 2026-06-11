FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
  openssl \
  libcrypto3 \
  libssl3 \
  libc6-compat \
  python3 \
  make \
  g++

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

