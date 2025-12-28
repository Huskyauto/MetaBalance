# Server Error Recovery - Quick Reference

## Quick Commands

### Check Server Health
```bash
# One-time health check
pnpm run server:health

# Continuous monitoring
node scripts/health-check.mjs --watch
```

### Restart Server
```bash
# Auto-detect best mode
pnpm run server:restart

# Force production mode (recommended for file watcher issues)
pnpm run server:restart:prod

# Force dev mode
pnpm run server:restart:dev
```

### Monitor Server (Background Daemon)
```bash
# Start monitoring
pnpm run server:monitor

# Check status
pnpm run server:monitor:status

# Stop monitoring
pnpm run server:monitor:stop
```

### View Logs
```bash
# Error statistics
pnpm run logs:errors

# Last 20 errors
pnpm run logs:tail

# Clear logs
pnpm run logs:clear

# Watch logs in real-time
tail -f logs/server.log
tail -f logs/errors.log
```

## Common Issues

### File Watcher Limit (EMFILE)
```bash
# Quick fix: Use production mode
pnpm run server:restart:prod
```

### Port Already in Use
```bash
# Restart script automatically kills processes
pnpm run server:restart
```

### Server Crashed
```bash
# Full recovery
pkill -f "tsx server"
pnpm run server:restart:prod
pnpm run server:health
```

## For Full Documentation

See [SERVER_ERROR_RECOVERY.md](./SERVER_ERROR_RECOVERY.md) for complete documentation including:
- Detailed error descriptions
- Automated tools configuration
- Manual recovery procedures
- Monitoring & alerting setup
- Best practices
- Troubleshooting guide
