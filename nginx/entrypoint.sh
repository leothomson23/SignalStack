#!/bin/sh
# Custom entrypoint for SignalStack nginx container
# Generates self-signed SSL certs if they don't exist, then starts nginx

set -e

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="${SSL_DIR}/server.crt"
KEY_FILE="${SSL_DIR}/server.key"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "[entrypoint] SSL certificate not found, generating self-signed cert..."
    mkdir -p "$SSL_DIR"

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -sha256 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=US/ST=California/L=San Francisco/O=SignalStack/CN=signalstack.local"

    chmod 644 "$CERT_FILE"
    chmod 600 "$KEY_FILE"

    echo "[entrypoint] Self-signed SSL certificate generated for signalstack.local"
else
    echo "[entrypoint] SSL certificate already exists, skipping generation."
fi

echo "[entrypoint] Starting nginx..."
exec nginx -g 'daemon off;'
