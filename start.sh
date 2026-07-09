#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "  STMS — Production Build & Start"
echo "================================================"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "1/4: Installing backend dependencies..."
cd "$ROOT_DIR/stms-backend"
bun install

echo ""
echo "2/4: Installing frontend dependencies..."
cd "$ROOT_DIR/stms-frontend"
bun install

echo ""
echo "3/4: Building frontend..."
bun run build

echo ""
echo "4/4: Running database migration..."
cd "$ROOT_DIR/stms-backend"
bun prisma generate
bun prisma migrate deploy

echo ""
echo "================================================"
echo "  Starting STMS server..."
echo "================================================"
echo ""

NODE_ENV=production bun src/index.ts
