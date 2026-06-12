#!/bin/bash
# scripts/generate-secrets.sh — Génération des secrets de production Vectura

set -e

echo "=== Génération des secrets de production Vectura ==="

# JWT_SECRET (64 bytes = 512 bits)
JWT_SECRET=$(openssl rand -base64 64)
echo "JWT_SECRET=${JWT_SECRET}"

# REFRESH_TOKEN_SECRET
REFRESH_SECRET=$(openssl rand -base64 64)
echo "REFRESH_TOKEN_SECRET=${REFRESH_SECRET}"

# PostgreSQL mot de passe
DB_PASSWORD=$(openssl rand -base64 32 | tr -d /=+ | cut -c1-24)
echo "DB_PASSWORD=${DB_PASSWORD}"

# Clé de chiffrement backups
BACKUP_KEY=$(openssl rand -base64 32)
echo "BACKUP_ENCRYPTION_KEY=${BACKUP_KEY}"

echo ""
echo "⚠️  COPIER CES VALEURS DANS VOTRE .env.production ET VAULT"
echo "⚠️  NE JAMAIS COMMITTER CE FICHIER"