#!/bin/sh
set -eu

API_URL="${API_URL:-/api}"
WS_URL="${WS_URL:-/ws}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
export API_URL WS_URL GOOGLE_CLIENT_ID

envsubst '${API_URL} ${WS_URL} ${GOOGLE_CLIENT_ID}' \
  < /usr/share/nginx/html/config.template.json \
  > /usr/share/nginx/html/config.json

exec "$@"
