#!/bin/bash
# scripts/monitoring.sh — Dashboard de commandes pour monitoring Vectura

echo "=== Monitoring Vectura ==="
echo "$(date)"
echo ""

# Métriques système
echo "--- Système ---"
echo "CPU : $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM : $(free -m | awk 'NR==2{printf "%.1f%% (%s/%sMB)", $3*100/$2, $3, $2 }')"
echo "Disque : $(df -h / | awk 'NR==2{print $5}')"

# Conteneurs
echo ""
echo "--- Conteneurs ---"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Requêtes HTTP (depuis logs Nginx)
echo ""
echo "--- Trafic (dernière heure) ---"
sudo awk -v d1="$(date -d '1 hour ago' '+%d/%b/%Y:%H:%M')" '$4 > "["d1' /var/log/nginx/access.log | wc -l | xargs echo "Requêtes :"

# Erreurs 5xx
echo ""
echo "--- Erreurs 5xx (dernière heure) ---"
sudo awk '$9 ~ /^5/' /var/log/nginx/access.log | wc -l | xargs echo "Erreurs 5xx :"

# Temps de réponse moyen
echo ""
echo "--- Temps de réponse ---"
sudo awk '{sum+=$NF; count++} END {print "Moyenne : " sum/count "ms"}' /var/log/nginx/access.log

# Connexions DB
echo ""
echo "--- Connexions DB ---"
docker exec vectura-postgres psql -U vectura -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" | sed -n 3p

# File Redis
echo ""
echo "--- Redis ---"
docker exec vectura-redis redis-cli info stats | grep total_connections_received