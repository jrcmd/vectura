#!/bin/bash
# scripts/alerting.sh — Alerting basique pour Vectura (à exécuter via cron)

ALERT_EMAIL="admin@vectura.fr"
LOG_FILE="/var/log/vectura-alerts.log"

alert() {
    echo "$(date) : $1" | tee -a "$LOG_FILE"
    echo "$1" | mail -s "[VECTURA ALERTE] $2" "$ALERT_EMAIL"
}

# Vérification API
if ! curl -sf http://localhost:3000/health > /dev/null; then
    alert "❌ API DOWN — Healthcheck échoué" "API Indisponible"
fi

# Vérification DB
if ! docker exec vectura-postgres pg_isready -U vectura > /dev/null; then
    alert "❌ DB DOWN — PostgreSQL non répondant" "Base de données"
fi

# Vérification Redis
if ! docker exec vectura-redis redis-cli ping | grep -q PONG; then
    alert "❌ REDIS DOWN" "Cache Redis"
fi

# Espace disque > 90%
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 90 ]; then
    alert "⚠️ Disque presque plein : ${DISK_USAGE}%" "Espace disque"
fi

# RAM > 90%
RAM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$RAM_USAGE" -gt 90 ]; then
    alert "⚠️ RAM presque saturée : ${RAM_USAGE}%" "Mémoire"
fi

# Erreurs 5xx > 10/min
ERRORS_5XX=$(sudo awk -v d1="$(date -d '1 minute ago' '+%d/%b/%Y:%H:%M')" '$4 > "["d1 && $9 ~ /^5/' /var/log/nginx/access.log | wc -l)
if [ "$ERRORS_5XX" -gt 10 ]; then
    alert "⚠️ Pic d'erreurs 5xx : ${ERRORS_5XX}/min" "Erreurs serveur"
fi