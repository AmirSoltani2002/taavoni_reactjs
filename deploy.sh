#!/usr/bin/env bash
set -Eeuo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${SSH_KNOWN_HOSTS_FILE:?SSH_KNOWN_HOSTS_FILE is required}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_SERVICE="${DEPLOY_SERVICE:-frontend}"

case "${DEPLOY_SERVICE}" in
  backend | frontend) ;;
  *)
    echo "DEPLOY_SERVICE must be backend or frontend" >&2
    exit 2
    ;;
esac

ssh \
  -o BatchMode=yes \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="${SSH_KNOWN_HOSTS_FILE}" \
  -p "${DEPLOY_PORT}" \
  "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "cd ~/web && docker compose pull ${DEPLOY_SERVICE} && docker compose up -d --remove-orphans"
