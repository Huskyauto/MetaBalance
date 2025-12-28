#!/bin/bash
#
# Quick Server Restart Script
# 
# This script provides a simple way to restart the MetaBalance server
# with automatic fallback to production mode if dev mode fails.
#
# Usage:
#   ./scripts/restart-server.sh           # Auto-detect best mode
#   ./scripts/restart-server.sh dev       # Force dev mode
#   ./scripts/restart-server.sh prod      # Force production mode
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

MODE="${1:-auto}"

echo "=== MetaBalance Server Restart ==="
echo "Mode: $MODE"
echo "Project: $PROJECT_ROOT"
echo ""

# Kill existing server processes
echo "Stopping existing server processes..."
pkill -f "tsx server/_core/index.ts" || true
pkill -f "node.*server/_core/index.ts" || true
sleep 2

# Check file watcher limits
check_file_watchers() {
  if [ -f /proc/sys/fs/inotify/max_user_watches ]; then
    MAX_WATCHERS=$(cat /proc/sys/fs/inotify/max_user_watches)
    USED_WATCHERS=$(lsof 2>/dev/null | grep inotify | wc -l || echo "0")
    
    echo "File watchers: $USED_WATCHERS / $MAX_WATCHERS"
    
    if [ "$USED_WATCHERS" -gt 500 ]; then
      echo "WARNING: File watcher limit approaching. Using production mode."
      return 1
    fi
  fi
  
  return 0
}

# Start in development mode
start_dev() {
  echo ""
  echo "Starting server in DEVELOPMENT mode..."
  echo "This will watch for file changes and auto-reload."
  echo ""
  
  pnpm run dev &
  DEV_PID=$!
  
  echo "Dev server started (PID: $DEV_PID)"
  echo "Server will be available at http://localhost:3000"
}

# Start in production mode
start_prod() {
  echo ""
  echo "Building production bundle..."
  pnpm run build
  
  echo ""
  echo "Starting server in PRODUCTION mode..."
  echo "This serves the built bundle (no file watching)."
  echo ""
  
  npm exec tsx server/_core/index.ts &
  PROD_PID=$!
  
  echo "Production server started (PID: $PROD_PID)"
  echo "Server will be available at http://localhost:3000"
}

# Main logic
case "$MODE" in
  dev)
    start_dev
    ;;
  
  prod)
    start_prod
    ;;
  
  auto)
    if check_file_watchers; then
      echo "File watchers OK. Attempting dev mode..."
      
      if ! start_dev; then
        echo ""
        echo "Dev mode failed. Falling back to production mode..."
        start_prod
      fi
    else
      echo "File watcher limit exceeded. Using production mode..."
      start_prod
    fi
    ;;
  
  *)
    echo "Invalid mode: $MODE"
    echo "Usage: $0 [dev|prod|auto]"
    exit 1
    ;;
esac

echo ""
echo "Server restart complete!"
echo ""
echo "To check server status:"
echo "  curl http://localhost:3000/"
echo ""
echo "To view logs:"
echo "  tail -f logs/health-check.log"
echo ""
echo "To stop server:"
echo "  pkill -f 'tsx server/_core/index.ts'"
echo ""
