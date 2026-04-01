#!/bin/sh
# Generate a self-signed SSL certificate for SignalStack local development
# Uses SHA-256 with 2048-bit RSA key, valid for 365 days

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_FILE="${SCRIPT_DIR}/server.crt"
KEY_FILE="${SCRIPT_DIR}/server.key"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "[generate-cert] SSL certificate already exists, skipping generation."
    exit 0
fi

echo "[generate-cert] Generating self-signed SSL certificate..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -sha256 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=US/ST=California/L=San Francisco/O=SignalStack/CN=signalstack.local"

chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

echo "[generate-cert] SSL certificate generated successfully."
echo "  Certificate: $CERT_FILE"
echo "  Key:         $KEY_FILE"
