#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DEPLOY_HOST:-}" || -z "${DOMAIN:-}" ]]; then
  echo "DEPLOY_HOST and DOMAIN are required" >&2
  exit 1
fi

scp docker-compose.yml docker-compose.prod.yml .env.production.example "${DEPLOY_HOST}:/opt/vectura/"
ssh "${DEPLOY_HOST}" "cd /opt/vectura && cp .env.production.example .env && sed -i \"s/^DOMAIN=.*/DOMAIN=${DOMAIN}/\" .env && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --build"
