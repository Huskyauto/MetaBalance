# MetaBalance TODO

## Website Loading Issue (Dec 27, 2025)
- [x] Diagnose why website shows blank page despite server running - Proxy MIME type caching issue
- [x] Try alternative server configuration to bypass proxy caching - Changed to port 3001
- [x] Modify Express static file serving with explicit headers - Added MIME type enforcement
- [x] Test if app loads correctly - Working perfectly on port 3001
- [x] Save working configuration

## Server Error Recovery System (Dec 27, 2025)
- [x] Diagnose current dev server error (exit code 1) - File watcher limit (EMFILE)
- [x] Create automated error detection script (health-check.mjs)
- [x] Implement health monitoring with auto-restart (server-monitor.mjs)
- [x] Add comprehensive error logging system (error-logger.mjs)
- [x] Create server recovery documentation (SERVER_ERROR_RECOVERY.md)
- [x] Test error recovery mechanisms (all scripts working)
- [x] Add npm scripts for easy access (server:restart, server:health, etc.)
- [x] Create quick restart script (restart-server.sh)

## Solution Summary
**Root Cause:** Manus proxy was caching broken responses on port 3000, serving HTML instead of JavaScript for module files.

**Fix Applied:**
1. Changed default server port from 3000 to 3001 to bypass proxy cache
2. Added explicit MIME type headers for all static files (.js, .mjs, .css, .json, .wasm)
3. Added X-Content-Type-Options: nosniff header to prevent MIME sniffing
4. Configured proper cache control (immutable for hashed assets, no-cache for HTML)

**Result:** Website now loads perfectly on https://3001-ik3jagki4gyahl72h1bhg-e4bb4e30.manusvm.computer/


## Published Site Issue (Dec 27, 2025)
- [x] Investigate why published site doesn't load - Port 3001 not standard for publishing
- [x] Check if port configuration affects published deployment - Reverted to port 3000
- [x] Verify published site uses correct server configuration - MIME types in place
- [x] Rebuild with port 3000 and MIME type fixes
- [x] Add aggressive cache-busting headers (Pragma, Expires, Vary)
- [x] Save checkpoint (42bfc9c4) - ready to republish
- [ ] User to click Publish button in UI
- [ ] Test published site after deployment completes


## Dev Server EMFILE Error Blocking Publish (Dec 27, 2025)
- [x] Fix file watcher EMFILE error permanently - Disabled HMR and file watching
- [x] Configure Vite to disable file watchers (watch: null, hmr: false)
- [x] Removed tsx watch mode from dev script
- [x] Restart dev server successfully - Running on port 3000
- [x] Verify preview screenshot generates - Screenshot captured!
- [ ] Save checkpoint and complete publish
