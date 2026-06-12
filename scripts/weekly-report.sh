#!/bin/bash
# scripts/weekly-report.sh — Rapport hebdomadaire Vectura

REPORT_DATE=$(date)

echo "=== Rapport Hebdomadaire Vectura — ${REPORT_DATE} ==="
echo ""

# Métriques système
echo "--- Statistiques Système ---"
echo "CPU Load Average : $(awk '{print $1, $2, $3}' /proc/loadavg)"
echo "RAM Usage : $(free -m | awk 'NR==2{printf "%.1f%% (%s/%sMB)", $3*100/$2, $3, $2 }')"
echo "Disque Usage : $(df -h / | awk 'NR==2{print $5}')"
echo ""

# Conteneurs
echo "--- Statut Conteneurs ---"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Statistiques DB
echo "--- Statistiques Base de Données ---"
docker exec vectura-postgres psql -U vectura -d vectura_prod -c "
SELECT 
    'Utilisateurs' as type, count(*) as count FROM \"User\"
UNION ALL
SELECT 
    'Chauffeurs', count(*) FROM \"Driver\"
UNION ALL
SELECT 
    'Entreprises', count(*) FROM \"Company\"
UNION ALL
SELECT 
    'Missions', count(*) FROM \"Mission\"
UNION ALL
SELECT 
    'Missions Pourvues', count(*) FROM \"Mission\" WHERE status = 'POURVUE';
" | sed '1,2d' || echo "Impossible de récupérer les stats DB"
echo ""

# Erreurs récentes
echo "--- Erreurs 5xx (7 derniers jours) ---"
sudo grep -c " 5[0-9][0-9] " /var/log/nginx/access.log 2>/dev/null || echo "0"
echo ""

# Backups
echo "--- Backups Disponibles ---"
ls -lah /backups/*.gpg 2>/dev/null | tail -5 || echo "Aucun backup trouvé"
echo ""

echo "=== Fin du rapport ==="