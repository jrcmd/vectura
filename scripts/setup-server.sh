#!/bin/bash
# scripts/setup-server.sh — Configuration serveur Vectura

set -e

SERVER_IP="${1:-VOTRE_IP}"
SSH_KEY="${2:-~/.ssh/id_rsa.pub}"

echo "=== Configuration serveur Vectura (${SERVER_IP}) ==="

# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Outils essentiels
sudo apt install -y curl wget git vim htop net-tools ufw fail2ban

# Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installé"
fi

# Docker Compose
sudo apt install -y docker-compose-plugin

# Nginx
sudo apt install -y nginx

# Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Node.js (pour outils CLI si besoin)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (gestion process Node.js)
sudo npm install -g pm2

# Configuration UFW (Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000/tcp  # API interne (si pas via Nginx)
sudo ufw --force enable

echo "✅ Serveur configuré. Déconnectez-vous et reconnectez-vous pour Docker."