#!/bin/bash
set -e

NEBULAR_DIR="/Users/gilles/WebstormProjects/Guestway/nebular"
PLATFORM_DIR="/Users/gilles/WebstormProjects/Guestway/angular-platform"
ENV="${1:-local}"
PORT="${2:-4200}"

cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    jobs -p 2>/dev/null | xargs -r kill 2>/dev/null || true
    cd "$PLATFORM_DIR"
    rm -rf node_modules/@nebular 2>/dev/null || true
    npm install --prefer-offline --no-audit > /dev/null 2>&1 &
    echo "✅ Restoring node_modules in background"
}
trap cleanup EXIT INT TERM

# Kill any existing ng serve on the port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  nebular → angular-platform (hot reload)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build nebular packages
echo "📦 Building nebular packages..."
cd "$NEBULAR_DIR"
npm run build:packages

# Clear Angular cache and create symlinks
echo "🔗 Creating symlinks..."
cd "$PLATFORM_DIR"
rm -rf .angular 2>/dev/null || true
rm -rf node_modules/@nebular
mkdir -p node_modules/@nebular
for pkg in theme auth security eva-icons date-fns firebase-auth moment; do
    ln -sf "$NEBULAR_DIR/dist/$pkg" "node_modules/@nebular/$pkg"
done
echo "   ✅ Symlinks ready"

# Start theme watcher only (auth depends on theme, causes issues in watch mode)
echo ""
echo "👀 Starting theme watcher..."
cd "$NEBULAR_DIR"
npx ng build theme --watch 2>&1 | sed 's/^/[theme] /' &
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔥 HOT RELOAD ACTIVE"
echo "  Edit: nebular/src/framework/theme/*"
echo "  (For auth changes: Ctrl+C, then rerun)"
echo "  Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start angular-platform with polling
cd "$PLATFORM_DIR"
npm run ng_high_mem -- serve --configuration "platform-$ENV" --port $PORT --poll 1000
