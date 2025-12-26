#!/bin/bash
set -e

# =============================================================================
# Run angular-platform with local nebular packages (isolated shadow project)
#
# This creates a shadow project in .angular-platform-dev/ that symlinks source
# files from angular-platform but has its own node_modules. The original
# angular-platform folder is NEVER modified.
#
# Usage:
#   ./dev-angular-platform.sh [environment] [port]
#   ./dev-angular-platform.sh reset    # Delete shadow project and start fresh
#
# Environments: local (default), dev, staging, prod
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEBULAR_DIR="$SCRIPT_DIR"
PLATFORM_DIR="$SCRIPT_DIR/../angular-platform"
SHADOW_DIR="$SCRIPT_DIR/.angular-platform-dev"

ENV="${1:-local}"
PORT="${2:-4200}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Handle reset command
if [ "$ENV" = "reset" ]; then
    echo -e "${YELLOW}🗑️  Removing shadow project...${NC}"
    rm -rf "$SHADOW_DIR"
    echo -e "${GREEN}✅ Shadow project removed. Run again to recreate.${NC}"
    exit 0
fi

# Validate environment
case "$ENV" in
    local|dev|staging|prod) ;;
    *)
        echo -e "${RED}❌ Unknown environment: $ENV${NC}"
        echo "   Valid options: local, dev, staging, prod"
        echo "   Or use 'reset' to delete the shadow project"
        exit 1
        ;;
esac

# Check angular-platform exists
if [ ! -d "$PLATFORM_DIR" ]; then
    echo -e "${RED}❌ angular-platform not found at $PLATFORM_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  nebular → angular-platform (isolated)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# =============================================================================
# Setup shadow project (first run or after reset)
# =============================================================================
setup_shadow_project() {
    echo -e "${CYAN}📁 Setting up shadow project...${NC}"
    
    mkdir -p "$SHADOW_DIR"
    cd "$SHADOW_DIR"
    
    # Create symlinks to source directories
    echo "   Creating symlinks to source files..."
    ln -sf "$PLATFORM_DIR/src" src
    ln -sf "$PLATFORM_DIR/public" public
    
    # Copy config files (these may need modification)
    echo "   Copying config files..."
    cp "$PLATFORM_DIR/package.json" package.json
    cp "$PLATFORM_DIR/package-lock.json" package-lock.json 2>/dev/null || true
    cp "$PLATFORM_DIR/tsconfig.json" tsconfig.json
    cp "$PLATFORM_DIR/tsconfig.app.json" tsconfig.app.json
    cp "$PLATFORM_DIR/angular.json" angular.json
    
    # Modify angular.json to add prebundle.exclude for @nebular packages
    echo "   Configuring angular.json for local nebular..."
    # Use node to modify JSON properly
    node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
        
        // Add prebundle.exclude to serve options
        if (config.projects?.guestway?.architect?.serve?.options) {
            config.projects.guestway.architect.serve.options.prebundle = {
                exclude: [
                    '@nebular/theme',
                    '@nebular/auth',
                    '@nebular/security',
                    '@nebular/eva-icons',
                    '@nebular/date-fns',
                    '@nebular/firebase-auth',
                    '@nebular/moment'
                ]
            };
        }
        
        fs.writeFileSync('angular.json', JSON.stringify(config, null, 2));
    "
    
    # Store hash of source angular.json for change detection
    md5sum "$PLATFORM_DIR/angular.json" | cut -d' ' -f1 > .angular-json-source-hash
    
    echo -e "${GREEN}   ✅ Shadow project structure ready${NC}"
}

# =============================================================================
# Install dependencies (only if node_modules doesn't exist)
# =============================================================================
install_deps() {
    if [ ! -d "$SHADOW_DIR/node_modules" ]; then
        echo -e "${CYAN}📦 Installing dependencies (first run, this takes ~2 min)...${NC}"
        cd "$SHADOW_DIR"
        npm install
        echo -e "${GREEN}   ✅ Dependencies installed${NC}"
    else
        echo -e "${GREEN}📦 Dependencies already installed${NC}"
    fi
}

# =============================================================================
# Build nebular packages
# =============================================================================
build_nebular() {
    echo -e "${CYAN}🔨 Building nebular packages...${NC}"
    cd "$NEBULAR_DIR"
    npm run build:packages
    echo -e "${GREEN}   ✅ Nebular packages built${NC}"
}

# =============================================================================
# Link nebular packages to shadow project
# =============================================================================
link_nebular() {
    echo -e "${CYAN}🔗 Linking nebular packages...${NC}"
    cd "$SHADOW_DIR"
    
    # Remove existing @nebular and create fresh symlinks
    rm -rf node_modules/@nebular
    mkdir -p node_modules/@nebular
    
    for pkg in theme auth security eva-icons date-fns firebase-auth moment; do
        ln -sf "$NEBULAR_DIR/dist/$pkg" "node_modules/@nebular/$pkg"
    done
    
    # Clear Angular cache
    rm -rf .angular 2>/dev/null || true
    
    echo -e "${GREEN}   ✅ Nebular packages linked${NC}"
}

# =============================================================================
# Check for config file changes (when shadow project already exists)
# =============================================================================
check_config_changes() {
    local needs_npm_install=false
    local needs_rebuild=false
    
    echo -e "${CYAN}🔍 Checking for config changes...${NC}"
    
    # Check package.json
    if ! diff -q "$PLATFORM_DIR/package.json" "$SHADOW_DIR/package.json" > /dev/null 2>&1; then
        echo -e "${YELLOW}   📦 package.json changed → will run npm install${NC}"
        cp "$PLATFORM_DIR/package.json" "$SHADOW_DIR/package.json"
        cp "$PLATFORM_DIR/package-lock.json" "$SHADOW_DIR/package-lock.json" 2>/dev/null || true
        needs_npm_install=true
    fi
    
    # Check tsconfig.json
    if ! diff -q "$PLATFORM_DIR/tsconfig.json" "$SHADOW_DIR/tsconfig.json" > /dev/null 2>&1; then
        echo -e "${YELLOW}   📝 tsconfig.json changed → updating${NC}"
        cp "$PLATFORM_DIR/tsconfig.json" "$SHADOW_DIR/tsconfig.json"
        needs_rebuild=true
    fi
    
    # Check tsconfig.app.json
    if ! diff -q "$PLATFORM_DIR/tsconfig.app.json" "$SHADOW_DIR/tsconfig.app.json" > /dev/null 2>&1; then
        echo -e "${YELLOW}   📝 tsconfig.app.json changed → updating${NC}"
        cp "$PLATFORM_DIR/tsconfig.app.json" "$SHADOW_DIR/tsconfig.app.json"
        needs_rebuild=true
    fi
    
    # Check angular.json (compare source, then apply our modifications)
    # We need to compare the source angular.json, not our modified shadow version
    # Store a hash of the source in a marker file
    local source_hash=$(md5sum "$PLATFORM_DIR/angular.json" | cut -d' ' -f1)
    local stored_hash=""
    if [ -f "$SHADOW_DIR/.angular-json-source-hash" ]; then
        stored_hash=$(cat "$SHADOW_DIR/.angular-json-source-hash")
    fi
    
    if [ "$source_hash" != "$stored_hash" ]; then
        echo -e "${YELLOW}   📝 angular.json changed → updating with nebular config${NC}"
        cp "$PLATFORM_DIR/angular.json" "$SHADOW_DIR/angular.json"
        
        # Re-apply our modifications
        cd "$SHADOW_DIR"
        node -e "
            const fs = require('fs');
            const config = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
            
            if (config.projects?.guestway?.architect?.serve?.options) {
                config.projects.guestway.architect.serve.options.prebundle = {
                    exclude: [
                        '@nebular/theme',
                        '@nebular/auth',
                        '@nebular/security',
                        '@nebular/eva-icons',
                        '@nebular/date-fns',
                        '@nebular/firebase-auth',
                        '@nebular/moment'
                    ]
                };
            }
            
            fs.writeFileSync('angular.json', JSON.stringify(config, null, 2));
        "
        echo "$source_hash" > "$SHADOW_DIR/.angular-json-source-hash"
        needs_rebuild=true
    fi
    
    if [ "$needs_npm_install" = true ]; then
        echo -e "${CYAN}📦 Running npm install due to package.json changes...${NC}"
        cd "$SHADOW_DIR"
        npm install
        echo -e "${GREEN}   ✅ Dependencies updated${NC}"
    elif [ "$needs_rebuild" = true ]; then
        echo -e "${CYAN}   🔄 Config updated, will rebuild${NC}"
        # Clear Angular cache to force rebuild
        rm -rf "$SHADOW_DIR/.angular" 2>/dev/null || true
    else
        echo -e "${GREEN}   ✅ No config changes${NC}"
    fi
}

# =============================================================================
# Main
# =============================================================================

# Kill any existing process on the port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Setup shadow project if needed, or check for changes
if [ ! -d "$SHADOW_DIR" ]; then
    setup_shadow_project
else
    check_config_changes
fi

# Install deps if needed
install_deps

# Build nebular
build_nebular

# Link nebular to shadow project
link_nebular

# Start theme watcher
echo ""
echo -e "${CYAN}👀 Starting theme watcher...${NC}"
cd "$NEBULAR_DIR"
npx ng build theme --watch 2>&1 | sed 's/^/[theme] /' &
WATCHER_PID=$!
sleep 3

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🔥 HOT RELOAD ACTIVE${NC}"
echo -e "${BLUE}  Edit: nebular/src/framework/theme/*${NC}"
echo -e "${BLUE}  (For auth changes: Ctrl+C, then rerun)${NC}"
echo -e "${BLUE}  Ctrl+C to stop${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping...${NC}"
    kill $WATCHER_PID 2>/dev/null || true
    # No need to restore anything - shadow project is isolated!
    echo -e "${GREEN}✅ Stopped. Original angular-platform unchanged.${NC}"
}
trap cleanup EXIT INT TERM

# Start dev server from shadow project
cd "$SHADOW_DIR"
npx ng serve --configuration "platform-$ENV" --port $PORT --poll 1000
