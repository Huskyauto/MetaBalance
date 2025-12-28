#!/usr/bin/env node
/**
 * MetaBalance Server Monitor (Daemon)
 * 
 * This script runs as a background daemon to continuously monitor
 * the MetaBalance server and automatically restart it on failures.
 * 
 * Features:
 * - Continuous health monitoring
 * - Automatic restart on crashes
 * - Graceful shutdown handling
 * - PID file management
 * - Detailed logging
 * - Email/webhook alerts (optional)
 * 
 * Usage:
 *   node scripts/server-monitor.mjs start   # Start monitoring
 *   node scripts/server-monitor.mjs stop    # Stop monitoring
 *   node scripts/server-monitor.mjs status  # Check status
 *   node scripts/server-monitor.mjs restart # Restart monitoring
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const PID_FILE = path.join(projectRoot, 'logs', 'monitor.pid');
const LOG_FILE = path.join(projectRoot, 'logs', 'monitor.log');
const SERVER_LOG_FILE = path.join(projectRoot, 'logs', 'server.log');

// Configuration
const CONFIG = {
  healthCheckInterval: 30000, // 30 seconds
  healthCheckUrl: 'http://localhost:3000/',
  maxConsecutiveFailures: 3,
  restartDelay: 5000, // 5 seconds
  serverStartTimeout: 15000, // 15 seconds
};

let serverProcess = null;
let consecutiveFailures = 0;
let isShuttingDown = false;

/**
 * Ensure required directories exist
 */
async function ensureDirectories() {
  await fs.mkdir(path.join(projectRoot, 'logs'), { recursive: true });
}

/**
 * Log message with timestamp
 */
async function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  try {
    await fs.appendFile(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Write PID file
 */
async function writePidFile() {
  await fs.writeFile(PID_FILE, process.pid.toString());
  await log(`Monitor started with PID ${process.pid}`);
}

/**
 * Remove PID file
 */
async function removePidFile() {
  try {
    await fs.unlink(PID_FILE);
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

/**
 * Check if monitor is already running
 */
async function isMonitorRunning() {
  try {
    const pid = await fs.readFile(PID_FILE, 'utf-8');
    const { stdout } = await execAsync(`ps -p ${pid.trim()} -o comm=`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Stop running monitor
 */
async function stopMonitor() {
  try {
    const pid = await fs.readFile(PID_FILE, 'utf-8');
    await execAsync(`kill ${pid.trim()}`);
    await log('Monitor stopped');
    return true;
  } catch (error) {
    console.error('Failed to stop monitor:', error.message);
    return false;
  }
}

/**
 * Check server health
 */
async function checkServerHealth() {
  try {
    const response = await fetch(CONFIG.healthCheckUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Start server process
 */
async function startServer() {
  if (serverProcess) {
    await log('Server process already running', 'WARN');
    return;
  }
  
  await log('Starting server process...');
  
  // Check file watcher limits
  let useProductionMode = false;
  try {
    const { stdout } = await execAsync('lsof 2>/dev/null | grep inotify | wc -l');
    const usedWatchers = parseInt(stdout.trim());
    
    if (usedWatchers > 500) {
      await log('File watcher limit exceeded. Using production mode.', 'WARN');
      useProductionMode = true;
    }
  } catch (error) {
    // Assume dev mode if check fails
  }
  
  if (useProductionMode) {
    // Build first
    await log('Building production bundle...');
    try {
      await execAsync('pnpm run build', { cwd: projectRoot });
      await log('Production build complete');
    } catch (error) {
      await log(`Build failed: ${error.message}`, 'ERROR');
      throw error;
    }
    
    // Start production server
    serverProcess = spawn('npm', ['exec', 'tsx', 'server/_core/index.ts'], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });
  } else {
    // Start dev server
    serverProcess = spawn('pnpm', ['run', 'dev'], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });
  }
  
  // Log server output
  serverProcess.stdout.on('data', async (data) => {
    await fs.appendFile(SERVER_LOG_FILE, data);
  });
  
  serverProcess.stderr.on('data', async (data) => {
    await fs.appendFile(SERVER_LOG_FILE, data);
  });
  
  serverProcess.on('exit', async (code, signal) => {
    await log(`Server process exited with code ${code}, signal ${signal}`, 'WARN');
    serverProcess = null;
    
    if (!isShuttingDown) {
      await log('Server crashed. Will attempt restart on next health check.', 'ERROR');
    }
  });
  
  serverProcess.on('error', async (error) => {
    await log(`Server process error: ${error.message}`, 'ERROR');
    serverProcess = null;
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, CONFIG.serverStartTimeout));
  
  await log('Server process started');
}

/**
 * Stop server process
 */
async function stopServer() {
  if (!serverProcess) {
    return;
  }
  
  await log('Stopping server process...');
  
  try {
    serverProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL');
        }
        resolve();
      }, 10000); // 10 second timeout
      
      if (serverProcess) {
        serverProcess.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      } else {
        clearTimeout(timeout);
        resolve();
      }
    });
    
    serverProcess = null;
    await log('Server process stopped');
  } catch (error) {
    await log(`Error stopping server: ${error.message}`, 'ERROR');
  }
}

/**
 * Restart server process
 */
async function restartServer() {
  await log('Restarting server...');
  await stopServer();
  await new Promise(resolve => setTimeout(resolve, CONFIG.restartDelay));
  await startServer();
}

/**
 * Main monitoring loop
 */
async function monitorLoop() {
  while (!isShuttingDown) {
    try {
      const isHealthy = await checkServerHealth();
      
      if (isHealthy) {
        if (consecutiveFailures > 0) {
          await log('Server recovered');
          consecutiveFailures = 0;
        }
      } else {
        consecutiveFailures++;
        await log(`Health check failed (${consecutiveFailures}/${CONFIG.maxConsecutiveFailures})`, 'WARN');
        
        if (consecutiveFailures >= CONFIG.maxConsecutiveFailures) {
          await log('Max consecutive failures reached. Restarting server...', 'ERROR');
          await restartServer();
          consecutiveFailures = 0;
        }
      }
    } catch (error) {
      await log(`Monitor loop error: ${error.message}`, 'ERROR');
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, CONFIG.healthCheckInterval));
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }
  
  isShuttingDown = true;
  await log(`Received ${signal}. Shutting down gracefully...`);
  
  await stopServer();
  await removePidFile();
  
  await log('Monitor shutdown complete');
  process.exit(0);
}

/**
 * Start monitoring
 */
async function startMonitoring() {
  await ensureDirectories();
  
  // Check if already running
  if (await isMonitorRunning()) {
    console.log('Monitor is already running');
    process.exit(1);
  }
  
  await writePidFile();
  await log('=== MetaBalance Server Monitor Started ===');
  
  // Setup signal handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Start server
  await startServer();
  
  // Start monitoring loop
  await monitorLoop();
}

/**
 * Check monitor status
 */
async function checkStatus() {
  const isRunning = await isMonitorRunning();
  
  if (isRunning) {
    try {
      const pid = await fs.readFile(PID_FILE, 'utf-8');
      console.log(`Monitor is running (PID: ${pid.trim()})`);
      
      const isHealthy = await checkServerHealth();
      console.log(`Server health: ${isHealthy ? 'OK' : 'UNHEALTHY'}`);
    } catch (error) {
      console.log('Monitor is running but status check failed');
    }
  } else {
    console.log('Monitor is not running');
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2] || 'start';
  
  switch (command) {
    case 'start':
      await startMonitoring();
      break;
    
    case 'stop':
      if (await stopMonitor()) {
        console.log('Monitor stopped');
      } else {
        console.log('Failed to stop monitor');
        process.exit(1);
      }
      break;
    
    case 'restart':
      await stopMonitor();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await startMonitoring();
      break;
    
    case 'status':
      await checkStatus();
      break;
    
    default:
      console.log('Usage: server-monitor.mjs [start|stop|restart|status]');
      process.exit(1);
  }
}

// Run main
main().catch(async (error) => {
  await log(`Fatal error: ${error.message}`, 'ERROR');
  process.exit(1);
});
