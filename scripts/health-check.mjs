#!/usr/bin/env node
/**
 * Server Health Check & Auto-Recovery Script
 * 
 * This script monitors the MetaBalance server and automatically recovers from errors.
 * 
 * Features:
 * - HTTP health check on port 3000
 * - Process monitoring (checks if server is running)
 * - Automatic restart on failure
 * - Error logging with timestamps
 * - File watcher limit detection
 * - Production build fallback
 * 
 * Usage:
 *   node scripts/health-check.mjs
 *   node scripts/health-check.mjs --watch  (continuous monitoring)
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const logFile = path.join(projectRoot, 'logs', 'health-check.log');

// Configuration
const CONFIG = {
  serverPort: 3000,
  healthCheckUrl: 'http://localhost:3000/',
  maxRestartAttempts: 3,
  restartDelay: 5000, // 5 seconds
  watchInterval: 30000, // 30 seconds
  fileWatcherThreshold: 500, // Max file watchers before switching to production mode
};

// Ensure logs directory exists
await fs.mkdir(path.join(projectRoot, 'logs'), { recursive: true });

/**
 * Log message with timestamp
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Append to log file
  fs.appendFile(logFile, logMessage).catch(err => {
    console.error('Failed to write to log file:', err);
  });
}

/**
 * Check if server process is running
 */
async function isServerProcessRunning() {
  try {
    const { stdout } = await execAsync('ps aux | grep "tsx server/_core/index.ts" | grep -v grep');
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Check if server is responding to HTTP requests
 */
async function isServerResponding() {
  try {
    const response = await fetch(CONFIG.healthCheckUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    log(`Server not responding: ${error.message}`, 'WARN');
    return false;
  }
}

/**
 * Check file watcher limits
 */
async function checkFileWatcherLimits() {
  try {
    const { stdout } = await execAsync('cat /proc/sys/fs/inotify/max_user_watches');
    const maxWatchers = parseInt(stdout.trim());
    
    const { stdout: usedStdout } = await execAsync('lsof 2>/dev/null | grep inotify | wc -l');
    const usedWatchers = parseInt(usedStdout.trim());
    
    log(`File watchers: ${usedWatchers} / ${maxWatchers}`, 'INFO');
    
    if (usedWatchers > CONFIG.fileWatcherThreshold) {
      log('File watcher limit approaching threshold. Consider using production build.', 'WARN');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Failed to check file watcher limits: ${error.message}`, 'WARN');
    return true; // Assume OK if check fails
  }
}

/**
 * Kill existing server processes
 */
async function killServerProcesses() {
  try {
    log('Killing existing server processes...', 'INFO');
    await execAsync('pkill -f "tsx server/_core/index.ts" || true');
    await execAsync('pkill -f "node.*server/_core/index.ts" || true');
    
    // Wait for processes to die
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    log('Server processes killed', 'INFO');
  } catch (error) {
    log(`Error killing processes: ${error.message}`, 'ERROR');
  }
}

/**
 * Start server in development mode
 */
async function startDevServer() {
  return new Promise((resolve, reject) => {
    log('Starting server in development mode...', 'INFO');
    
    const devProcess = spawn('pnpm', ['run', 'dev'], {
      cwd: projectRoot,
      stdio: 'inherit',
      detached: true,
    });
    
    devProcess.on('error', (error) => {
      log(`Failed to start dev server: ${error.message}`, 'ERROR');
      reject(error);
    });
    
    // Wait for server to start
    setTimeout(() => {
      log('Dev server started', 'INFO');
      resolve();
    }, 5000);
  });
}

/**
 * Start server in production mode (build + serve)
 */
async function startProductionServer() {
  try {
    log('Building production bundle...', 'INFO');
    await execAsync('pnpm run build', { cwd: projectRoot });
    log('Production build complete', 'INFO');
    
    return new Promise((resolve, reject) => {
      log('Starting server in production mode...', 'INFO');
      
      const prodProcess = spawn('npm', ['exec', 'tsx', 'server/_core/index.ts'], {
        cwd: projectRoot,
        stdio: 'inherit',
        detached: true,
      });
      
      prodProcess.on('error', (error) => {
        log(`Failed to start production server: ${error.message}`, 'ERROR');
        reject(error);
      });
      
      // Wait for server to start
      setTimeout(() => {
        log('Production server started', 'INFO');
        resolve();
      }, 5000);
    });
  } catch (error) {
    log(`Production build failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * Restart server with automatic mode selection
 */
async function restartServer(useProductionMode = false) {
  try {
    await killServerProcesses();
    
    if (useProductionMode) {
      await startProductionServer();
    } else {
      // Check file watcher limits first
      const watchersOk = await checkFileWatcherLimits();
      
      if (!watchersOk) {
        log('File watcher limits exceeded. Switching to production mode.', 'WARN');
        await startProductionServer();
      } else {
        try {
          await startDevServer();
        } catch (error) {
          log('Dev mode failed. Falling back to production mode.', 'WARN');
          await startProductionServer();
        }
      }
    }
    
    return true;
  } catch (error) {
    log(`Failed to restart server: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Perform comprehensive health check
 */
async function performHealthCheck() {
  log('Performing health check...', 'INFO');
  
  const processRunning = await isServerProcessRunning();
  const serverResponding = await isServerResponding();
  
  if (!processRunning) {
    log('Server process is not running', 'ERROR');
    return { healthy: false, reason: 'process_not_running' };
  }
  
  if (!serverResponding) {
    log('Server is not responding to HTTP requests', 'ERROR');
    return { healthy: false, reason: 'not_responding' };
  }
  
  log('Server is healthy', 'INFO');
  return { healthy: true };
}

/**
 * Main health check and recovery logic
 */
async function main(watchMode = false) {
  log('=== MetaBalance Server Health Check ===', 'INFO');
  log(`Watch mode: ${watchMode}`, 'INFO');
  
  let restartAttempts = 0;
  
  const checkAndRecover = async () => {
    const health = await performHealthCheck();
    
    if (!health.healthy) {
      log(`Server unhealthy: ${health.reason}`, 'ERROR');
      
      if (restartAttempts >= CONFIG.maxRestartAttempts) {
        log(`Max restart attempts (${CONFIG.maxRestartAttempts}) reached. Manual intervention required.`, 'ERROR');
        
        if (!watchMode) {
          process.exit(1);
        }
        
        return;
      }
      
      restartAttempts++;
      log(`Attempting restart (${restartAttempts}/${CONFIG.maxRestartAttempts})...`, 'INFO');
      
      const useProductionMode = health.reason === 'file_watcher_limit';
      const success = await restartServer(useProductionMode);
      
      if (success) {
        // Wait and verify server started
        await new Promise(resolve => setTimeout(resolve, CONFIG.restartDelay));
        
        const verifyHealth = await performHealthCheck();
        if (verifyHealth.healthy) {
          log('Server successfully restarted and verified healthy', 'INFO');
          restartAttempts = 0; // Reset counter on success
        } else {
          log('Server restart failed verification', 'ERROR');
        }
      } else {
        log('Server restart failed', 'ERROR');
      }
    } else {
      // Reset restart counter when healthy
      if (restartAttempts > 0) {
        log('Server recovered. Resetting restart counter.', 'INFO');
        restartAttempts = 0;
      }
    }
  };
  
  // Initial check
  await checkAndRecover();
  
  // Watch mode - continuous monitoring
  if (watchMode) {
    log(`Starting continuous monitoring (interval: ${CONFIG.watchInterval}ms)`, 'INFO');
    
    setInterval(async () => {
      await checkAndRecover();
    }, CONFIG.watchInterval);
    
    // Keep process alive
    process.on('SIGINT', () => {
      log('Health check monitoring stopped', 'INFO');
      process.exit(0);
    });
  } else {
    log('Health check complete', 'INFO');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');

// Run main function
main(watchMode).catch(error => {
  log(`Fatal error: ${error.message}`, 'ERROR');
  process.exit(1);
});
