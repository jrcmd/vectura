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

# Create non-root user appuser (UID 1001) for security - Priorité 6
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Create required directories and set permissions for appuser
RUN mkdir -p /app/uploads /app/backups && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1

# Switch to non-root user appuser
USER appuser

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

