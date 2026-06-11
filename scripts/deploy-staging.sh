#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DEPLOY_HOST:-}" ]]; then
  echo "DEPLOY_HOST is required" >&2
  exit 1
fi

scp docker-compose.yml docker-compose.staging.yml .env.staging.example "${DEPLOY_HOST}:/opt/vectura/"
ssh "${DEPLOY_HOST}" "cd /opt/vectura && cp .env.staging.example .env && docker compose -f docker-compose.staging.yml pull && docker compose -f docker-compose.staging.yml up -d --build"
