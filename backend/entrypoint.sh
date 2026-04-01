#!/bin/sh
set -e

echo "[SignalStack] Waiting for database..."
sleep 3

echo "[SignalStack] Running database migrations..."
npx prisma db push --skip-generate

echo "[SignalStack] Seeding database..."
npx tsx prisma/seed.ts || echo "[SignalStack] Seed already applied or failed (continuing...)"

echo "[SignalStack] Starting server..."
exec npm run dev
