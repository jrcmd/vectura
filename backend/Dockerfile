# ============================================
# VECTURA BACKEND — Dockerfile Production
# ============================================

FROM node:20-alpine AS builder

# Dépendances de build
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

# Génération du client Prisma
RUN npx prisma generate

# Étape de production
FROM node:20-alpine AS production

# Installation des dépendances runtime
RUN apk add --no-cache curl wget ca-certificates

# Création utilisateur non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copie des dépendances depuis builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copie du code compilé
COPY dist ./dist

# Création des répertoires avec bonnes permissions
RUN mkdir -p /app/uploads /app/backups /app/logs && \
    chown -R appuser:appgroup /app

# Passage en non-root
USER appuser

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Port exposé (documentaire)
EXPOSE 3000

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

