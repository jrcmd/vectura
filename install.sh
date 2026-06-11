#!/bin/bash

# Vectura - Script d'installation automatique
# Usage: ./install.sh [docker|manual]

set -e  # Arrêt sur erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérification des dépendances
check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 est installé"
        return 0
    else
        log_error "$1 n'est pas installé"
        return 1
    fi
}

# Mode Docker
install_docker() {
    log_info "=== Installation avec Docker (recommandé) ==="

    # Vérifier Docker et docker compose
    if ! check_command "docker"; then
        log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        log_error "Le plugin docker compose n'est pas disponible. Veuillez l'installer d'abord."
        exit 1
    fi

    log_info "Démarrage des services avec docker compose..."
    docker compose up -d

    log_info "Attente du démarrage des services (10s)..."
    sleep 10

    # Vérification de l'installation
    log_info "Vérification de l'installation..."

    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Backend (API) accessible sur http://localhost:3000"
    else
        log_warn "Backend non accessible immédiatement, vérifiez les logs avec: docker compose logs -f"
    fi

    log_info "Frontend accessible sur http://localhost:5173"

    echo ""
    log_success "Installation terminée !"
    echo ""
    echo "Commandes utiles :"
    echo "  - Voir les logs    : docker compose logs -f"
    echo "  - Arrêter          : docker compose down"
    echo "  - Base de données  : psql postgresql://vectura:password@localhost:5432/vectura"
    echo "  - Redis            : redis-cli -p 6379"
}

# Mode Manuel (sans Docker)
install_manual() {
    log_info "=== Installation manuelle (sans Docker) ==="

    # Vérifier Node.js
    if ! check_command "node"; then
        log_error "Node.js n'est pas installé. Veuillez l'installer (version 18+ recommandée)."
        exit 1
    fi

    if ! check_command "npm"; then
        log_error "npm n'est pas installé."
        exit 1
    fi

    # Vérifier la version de Node
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_warn "Node.js version < 18 détectée. Version 18+ recommandée."
    fi

    # Installation du Backend
    log_info "Installation du Backend..."
    if [ -d "backend" ]; then
        cd backend

        log_info "Installation des dépendances npm..."
        npm install

        log_info "Génération du client Prisma..."
        npm run prisma:generate

        log_info "Exécution des migrations..."
        npm run prisma:migrate

        # Vérifier si .env existe
        if [ ! -f ".env" ]; then
            log_warn "Fichier .env non trouvé dans backend/"
            log_info "Création d'un fichier .env par défaut..."
            cat > .env << 'EOF'
DATABASE_URL="postgresql://vectura:password@localhost:5432/vectura"
REDIS_URL="redis://localhost:6379"
PORT=3000
EOF
            log_warn "Veuillez vérifier et adapter les variables dans backend/.env"
        fi

        cd ..
        log_success "Backend installé"
    else
        log_error "Dossier 'backend' non trouvé"
        exit 1
    fi

    # Installation du Frontend
    log_info "Installation du Frontend..."
    if [ -d "frontend" ]; then
        cd frontend

        log_info "Installation des dépendances npm..."
        npm install

        cd ..
        log_success "Frontend installé"
    else
        log_error "Dossier 'frontend' non trouvé"
        exit 1
    fi

    echo ""
    log_success "Installation terminée !"
    echo ""
    echo "Pour démarrer en mode développement :"
    echo ""
    echo "  Terminal 1 - Backend :"
    echo "    cd backend && npm run dev"
    echo ""
    echo "  Terminal 2 - Frontend :"
    echo "    cd frontend && npm run dev"
    echo ""
    echo "  Vérification :"
    echo "    curl http://localhost:3000/api/health"
    echo "    open http://localhost:5173"
}

# Mode complet (Docker + installation des dépendances)
install_full() {
    log_info "=== Installation complète avec Docker ==="

    if ! check_command "docker" || ! docker compose version &> /dev/null; then
        log_error "Docker et docker compose sont requis pour ce mode."
        exit 1
    fi

    # Démarrer les services
    docker compose up -d

    log_info "Attente du démarrage de la base de données (15s)..."
    sleep 15

    # Installation Backend
    if [ -d "backend" ]; then
        cd backend
        npm install
        npm run prisma:generate
        npm run prisma:migrate
        cd ..
    fi

    # Installation Frontend
    if [ -d "frontend" ]; then
        cd frontend
        npm install
        cd ..
    fi

    log_success "Installation complète terminée !"
    log_info "Backend : http://localhost:3000"
    log_info "Frontend : http://localhost:5173"
}

# Health check
health_check() {
    log_info "Vérification de l'état de l'application..."

    echo ""
    echo "=== Backend ==="
    if curl -s http://localhost:3000/api/health 2>/dev/null; then
        echo ""
        log_success "Backend est UP"
    else
        log_error "Backend est DOWN ou non accessible"
    fi

    echo ""
    echo "=== Services Docker ==="
    if docker compose version &> /dev/null; then
        docker compose ps
    fi
}

# Menu d'aide
show_help() {
    cat << 'EOF'
Usage: ./install.sh [COMMANDE]

Commandes:
  docker      Démarrer avec Docker (recommandé)
  manual      Installation manuelle sans Docker
  full        Installation complète (Docker + npm install)
  health      Vérifier l'état de l'application
  help        Afficher cette aide

Exemples:
  ./install.sh docker     # Démarrage rapide avec Docker
  ./install.sh manual     # Installation manuelle
  ./install.sh health     # Vérifier si tout fonctionne

EOF
}

# Point d'entrée
main() {
    echo ""
    echo "╔═══════════════════════════════════════╗"
    echo "║     Vectura - Script d'installation  ║"
    echo "╚═══════════════════════════════════════╝"
    echo ""

    case "${1:-docker}" in
        docker)
            install_docker
            ;;
        manual)
            install_manual
            ;;
        full)
            install_full
            ;;
        health)
            health_check
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"