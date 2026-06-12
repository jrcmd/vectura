#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/health}"
FRONT_URL="${FRONT_URL:-http://localhost:5173}"
TRIES=${HEALTH_TRIES:-12}
DELAY=${HEALTH_DELAY:-5}

echo "Attente de la passerelle applicative..."
for i in $(seq 1 "$TRIES"); do
  if curl -sf "$HEALTH_URL" >/dev/null; then
    echo "Backend OK"
    break
  fi
  sleep "$DELAY"
  if [[ "$i" == "$TRIES" ]]; then
    echo "Backend indisponible après $(($TRIES * $DELAY))s" >&2
    exit 1
  fi
done

echo "Vérification du frontend..."
if curl -sf "$FRONT_URL" >/dev/null; then
  echo "Frontend OK"
else
  echo "Frontend indisponible" >&2
  exit 1
fi
