#!/bin/sh
set -eu

if [ -z "${API_URL:-}" ]; then
  echo "Error: API_URL must be set to the backend API URL." >&2
  exit 1
fi

if [ -z "${WS_URL:-}" ]; then
  echo "Error: WS_URL must be set to the backend WebSocket URL." >&2
  exit 1
fi

envsubst '${API_URL} ${WS_URL} ${GOOGLE_CLIENT_ID}' \
  < /usr/share/nginx/html/config.template.json \
  > /usr/share/nginx/html/config.json

exec "$@"
