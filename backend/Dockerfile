FROM node:20-alpine

WORKDIR /app

# Prisma (engines) a besoin d'OpenSSL/compatibilité libc.
# Sur Alpine, on installe openssl et les libs nécessaires.
RUN apk add --no-cache \
  openssl \
  libcrypto3 \
  libssl3 \
  libc6-compat

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

