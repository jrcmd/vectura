#!/bin/bash
# scripts/setup-nginx.sh — Configuration Nginx + SSL

set -e

echo "=== Configuration Nginx + SSL ==="

# Créer les liens symboliques
sudo ln -sf /etc/nginx/sites-available/api.vectura.fr /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/app.vectura.fr /etc/nginx/sites-enabled/

# Supprimer le default
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Redémarrage Nginx
sudo systemctl restart nginx

# SSL Let's Encrypt (mode standalone temporairement)
sudo certbot --nginx -d api.vectura.fr -d app.vectura.fr --non-interactive --agree-tos --email admin@vectura.fr

# Auto-renewal cron
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Nginx configuré avec SSL"