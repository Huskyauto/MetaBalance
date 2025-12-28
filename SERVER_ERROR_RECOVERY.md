# Server Error Recovery System

**MetaBalance Server Health & Error Recovery Documentation**

This document describes the comprehensive error recovery system implemented for the MetaBalance application, including automated health monitoring, error logging, and recovery procedures.

---

## Overview

The MetaBalance server error recovery system provides:

1. **Automated Health Monitoring** - Continuous server health checks with automatic recovery
2. **Error Detection & Logging** - Structured error logging with categorization and alerting
3. **Automatic Restart** - Intelligent server restart with fallback to production mode
4. **File Watcher Management** - Automatic detection and handling of file watcher limits
5. **Manual Recovery Tools** - Scripts for quick manual intervention when needed

---

## Common Server Errors

### 1. File Watcher Limit Exceeded (EMFILE)

**Symptom:**
```
Error: EMFILE: too many open files, watch '/home/ubuntu/metabalance/server/_core/index.ts'
```

**Cause:** Development mode (tsx watch) uses file watchers to detect changes. When too many files are watched, the system runs out of file descriptors.

**Automatic Recovery:** The system detects this error and automatically switches to production mode (no file watching).

**Manual Fix:**
```bash
# Option 1: Restart in production mode (recommended)
pnpm run server:restart:prod

# Option 2: Increase file watcher limit (temporary)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Option 3: Kill stale watchers and restart
pkill -f "tsx watch"
pnpm run server:restart
```

### 2. Port Already in Use (EADDRINUSE)

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process is already using port 3000.

**Automatic Recovery:** Health check detects unresponsive server and kills existing processes before restart.

**Manual Fix:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use the restart script (automatically kills processes)
pnpm run server:restart
```

### 3. Database Connection Errors

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Cause:** Database server is not running or connection credentials are incorrect.

**Manual Fix:**
```bash
# Check database connection
mysql -h localhost -u root -p

# Verify DATABASE_URL in environment
echo $DATABASE_URL

# Restart server after fixing database
pnpm run server:restart
```

### 4. Out of Memory (OOM)

**Symptom:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Node.js process exceeded memory limit.

**Manual Fix:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Restart server
pnpm run server:restart
```

---

## Automated Tools

### 1. Health Check Script

**Purpose:** One-time health check with optional continuous monitoring

**Usage:**
```bash
# Single health check
pnpm run server:health

# Continuous monitoring (checks every 30 seconds)
node scripts/health-check.mjs --watch
```

**Features:**
- HTTP health check on port 3000
- Process monitoring
- File watcher limit detection
- Automatic restart on failure (up to 3 attempts)
- Detailed logging to `logs/health-check.log`

**Configuration:** Edit `scripts/health-check.mjs` to adjust:
- `serverPort`: Port to monitor (default: 3000)
- `maxRestartAttempts`: Max restart attempts (default: 3)
- `restartDelay`: Delay between restarts (default: 5000ms)
- `watchInterval`: Monitoring interval (default: 30000ms)

### 2. Server Monitor (Daemon)

**Purpose:** Background daemon for continuous server monitoring

**Usage:**
```bash
# Start monitoring daemon
pnpm run server:monitor

# Check status
pnpm run server:monitor:status

# Stop monitoring
pnpm run server:monitor:stop

# Restart monitoring
node scripts/server-monitor.mjs restart
```

**Features:**
- Runs as background process
- Continuous health checks every 30 seconds
- Automatic restart on consecutive failures (3+ failures)
- Graceful shutdown handling
- PID file management (`logs/monitor.pid`)
- Server output logging (`logs/server.log`)

**Recommended for:** Production deployments or long-running development sessions

### 3. Quick Restart Script

**Purpose:** Fast server restart with mode selection

**Usage:**
```bash
# Auto-detect best mode (checks file watchers)
pnpm run server:restart

# Force development mode (with file watching)
pnpm run server:restart:dev

# Force production mode (no file watching)
pnpm run server:restart:prod
```

**Features:**
- Kills existing server processes
- Checks file watcher limits
- Automatic fallback to production mode
- Fast restart (< 10 seconds)

**Recommended for:** Quick manual restarts during development

### 4. Error Logger

**Purpose:** Centralized error logging with categorization and alerting

**Usage:**
```bash
# View error statistics (last 24 hours)
pnpm run logs:errors

# View last 20 errors
pnpm run logs:tail

# Clear all error logs
pnpm run logs:clear

# Custom time range (last 6 hours)
node scripts/error-logger.mjs stats 6
```

**Features:**
- Structured error logging (JSON format)
- Error categorization (server, database, API, client, etc.)
- Severity levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Alert thresholds (trigger alerts after N errors)
- Log rotation (max 10MB per file)
- Error deduplication

**Log Files:**
- `logs/errors.log` - Human-readable error log
- `logs/errors.json` - JSON-formatted log for parsing
- `logs/alerts.log` - Critical alerts only

---

## Manual Recovery Procedures

### Quick Recovery (Most Common)

```bash
# 1. Check if server is running
curl http://localhost:3000/

# 2. If not responding, restart
pnpm run server:restart

# 3. Verify server started
curl http://localhost:3000/
# Should return 200 OK
```

### Full Recovery (After Crash)

```bash
# 1. Check server status
pnpm run server:monitor:status

# 2. View recent errors
pnpm run logs:tail

# 3. Kill all server processes
pkill -f "tsx server/_core/index.ts"
pkill -f "node.*server/_core/index.ts"

# 4. Clear stale file watchers (if EMFILE error)
pkill -f "tsx watch"

# 5. Restart in production mode (safest)
pnpm run server:restart:prod

# 6. Verify health
pnpm run server:health
```

### Emergency Recovery (Nothing Works)

```bash
# 1. Stop all monitoring
pnpm run server:monitor:stop

# 2. Kill ALL Node processes (nuclear option)
pkill -9 node

# 3. Clear logs
pnpm run logs:clear

# 4. Rebuild and restart
pnpm run build
pnpm run server:restart:prod

# 5. Start fresh monitoring
pnpm run server:monitor
```

---

## Monitoring & Alerts

### Real-Time Monitoring

```bash
# Watch server logs in real-time
tail -f logs/server.log

# Watch error logs in real-time
tail -f logs/errors.log

# Watch health check logs
tail -f logs/health-check.log

# Watch all logs
tail -f logs/*.log
```

### Error Statistics

```bash
# View error summary
pnpm run logs:errors

# Example output:
# Error Statistics (last 24 hours):
# Total errors: 15
# 
# By Severity:
# { ERROR: 12, WARN: 3 }
# 
# By Category:
# { server: 8, database: 4, api: 3 }
```

### Setting Up Alerts

Edit `scripts/error-logger.mjs` to configure alerts:

```javascript
const CONFIG = {
  // Alert after 10 ERRORs or 1 FATAL per hour
  alertThresholds: {
    ERROR: 10,
    FATAL: 1,
  },
  
  // Enable alert methods
  alerts: {
    console: true,
    file: true,
    webhook: false, // Set webhook URL below
    email: false,   // Requires email config
  },
  
  // Webhook URL for Slack/Discord/etc
  webhookUrl: process.env.ERROR_WEBHOOK_URL || null,
};
```

**Webhook Example (Slack):**
```bash
# Set webhook URL
export ERROR_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Restart error logger
# Alerts will now be sent to Slack
```

---

## Best Practices

### Development

1. **Use production mode for long sessions** to avoid file watcher issues:
   ```bash
   pnpm run server:restart:prod
   ```

2. **Monitor health during development:**
   ```bash
   node scripts/health-check.mjs --watch
   ```

3. **Check logs regularly:**
   ```bash
   pnpm run logs:errors
   ```

### Production

1. **Always use server monitor daemon:**
   ```bash
   pnpm run server:monitor
   ```

2. **Set up webhook alerts** for critical errors

3. **Monitor logs directory size:**
   ```bash
   du -sh logs/
   ```

4. **Rotate logs weekly** (automatic, but verify):
   ```bash
   ls -lh logs/*.log.*
   ```

### Troubleshooting

1. **Server won't start:**
   - Check if port 3000 is free: `lsof -i:3000`
   - Check database connection: `mysql -h localhost -u root -p`
   - Check environment variables: `env | grep DATABASE_URL`

2. **Frequent restarts:**
   - Check error logs: `pnpm run logs:errors`
   - Look for patterns in errors
   - Consider increasing memory: `export NODE_OPTIONS="--max-old-space-size=4096"`

3. **File watcher errors:**
   - Always use production mode: `pnpm run server:restart:prod`
   - Or increase limit: `sudo sysctl fs.inotify.max_user_watches=524288`

---

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm run server:restart` | Quick restart (auto-detect mode) |
| `pnpm run server:restart:dev` | Restart in dev mode (file watching) |
| `pnpm run server:restart:prod` | Restart in production mode (no watching) |
| `pnpm run server:health` | One-time health check |
| `pnpm run server:monitor` | Start monitoring daemon |
| `pnpm run server:monitor:stop` | Stop monitoring daemon |
| `pnpm run server:monitor:status` | Check monitor status |
| `pnpm run logs:errors` | View error statistics |
| `pnpm run logs:tail` | View last 20 errors |
| `pnpm run logs:clear` | Clear all error logs |

---

## File Structure

```
metabalance/
├── scripts/
│   ├── health-check.mjs       # Health check & auto-recovery
│   ├── server-monitor.mjs     # Background monitoring daemon
│   ├── restart-server.sh      # Quick restart script
│   └── error-logger.mjs       # Error logging & alerting
├── logs/
│   ├── health-check.log       # Health check logs
│   ├── server.log             # Server output logs
│   ├── errors.log             # Human-readable error log
│   ├── errors.json            # JSON error log
│   ├── alerts.log             # Critical alerts
│   └── monitor.pid            # Monitor daemon PID
└── SERVER_ERROR_RECOVERY.md   # This document
```

---

## Support

For issues not covered in this document:

1. **Check error logs:** `pnpm run logs:errors`
2. **Try emergency recovery** procedure above
3. **Review recent changes** in git: `git log --oneline -10`
4. **Check system resources:** `free -h`, `df -h`

---

## Changelog

**v1.0 (Dec 27, 2025)**
- Initial error recovery system implementation
- Health check script with auto-recovery
- Server monitor daemon
- Quick restart script
- Error logger with categorization and alerting
- Comprehensive documentation

---

**Last Updated:** December 27, 2025
