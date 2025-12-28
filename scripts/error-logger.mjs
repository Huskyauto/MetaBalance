#!/usr/bin/env node
/**
 * Error Logger & Alert System
 * 
 * Centralized error logging with categorization, severity levels,
 * and optional alerting (email, webhook, Slack, etc.)
 * 
 * Features:
 * - Structured error logging (JSON format)
 * - Error categorization (server, database, API, client)
 * - Severity levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Error aggregation and deduplication
 * - Alert thresholds (trigger alerts after N errors)
 * - Log rotation and cleanup
 * - Error analytics and reporting
 * 
 * Usage:
 *   import { logError, logWarning, logInfo } from './scripts/error-logger.mjs';
 *   
 *   logError('Database connection failed', {
 *     category: 'database',
 *     context: { host: 'localhost', port: 3306 }
 *   });
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const logsDir = path.join(projectRoot, 'logs');

// Ensure logs directory exists
await fs.mkdir(logsDir, { recursive: true });

// Log file paths
const ERROR_LOG = path.join(logsDir, 'errors.log');
const ERROR_JSON_LOG = path.join(logsDir, 'errors.json');
const ALERT_LOG = path.join(logsDir, 'alerts.log');

// Configuration
const CONFIG = {
  // Alert thresholds (errors per hour before alerting)
  alertThresholds: {
    ERROR: 10,
    FATAL: 1,
  },
  
  // Log rotation (max file size in MB)
  maxLogSize: 10,
  
  // Keep last N rotated logs
  maxRotatedLogs: 5,
  
  // Alert methods (enable/disable)
  alerts: {
    console: true,
    file: true,
    webhook: false, // Set webhook URL in environment
    email: false,   // Set email config in environment
  },
  
  // Webhook URL (optional)
  webhookUrl: process.env.ERROR_WEBHOOK_URL || null,
};

// Error categories
export const ErrorCategory = {
  SERVER: 'server',
  DATABASE: 'database',
  API: 'api',
  CLIENT: 'client',
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown',
};

// Severity levels
export const Severity = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',
};

// In-memory error tracking for deduplication
const errorCache = new Map();
const errorCounts = new Map();

/**
 * Create structured error entry
 */
function createErrorEntry(message, options = {}) {
  const {
    severity = Severity.ERROR,
    category = ErrorCategory.UNKNOWN,
    context = {},
    stack = null,
  } = options;
  
  return {
    timestamp: new Date().toISOString(),
    severity,
    category,
    message,
    context,
    stack,
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'unknown',
  };
}

/**
 * Generate error fingerprint for deduplication
 */
function getErrorFingerprint(entry) {
  return `${entry.category}:${entry.message}:${entry.stack?.split('\n')[0] || ''}`;
}

/**
 * Check if error should trigger alert
 */
function shouldAlert(entry) {
  const threshold = CONFIG.alertThresholds[entry.severity];
  if (!threshold) return false;
  
  const fingerprint = getErrorFingerprint(entry);
  const count = errorCounts.get(fingerprint) || 0;
  
  return count >= threshold;
}

/**
 * Send alert via configured methods
 */
async function sendAlert(entry) {
  const alertMessage = `
🚨 MetaBalance Error Alert

Severity: ${entry.severity}
Category: ${entry.category}
Message: ${entry.message}
Time: ${entry.timestamp}

Context: ${JSON.stringify(entry.context, null, 2)}
  `.trim();
  
  // Console alert
  if (CONFIG.alerts.console) {
    console.error('\n' + '='.repeat(60));
    console.error(alertMessage);
    console.error('='.repeat(60) + '\n');
  }
  
  // File alert
  if (CONFIG.alerts.file) {
    await fs.appendFile(ALERT_LOG, alertMessage + '\n\n');
  }
  
  // Webhook alert
  if (CONFIG.alerts.webhook && CONFIG.webhookUrl) {
    try {
      await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: alertMessage,
          severity: entry.severity,
          category: entry.category,
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }
}

/**
 * Rotate log file if it exceeds max size
 */
async function rotateLogIfNeeded(logFile) {
  try {
    const stats = await fs.stat(logFile);
    const sizeMB = stats.size / (1024 * 1024);
    
    if (sizeMB > CONFIG.maxLogSize) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = `${logFile}.${timestamp}`;
      
      await fs.rename(logFile, rotatedFile);
      
      // Clean up old rotated logs
      const dir = path.dirname(logFile);
      const basename = path.basename(logFile);
      const files = await fs.readdir(dir);
      
      const rotatedFiles = files
        .filter(f => f.startsWith(basename + '.'))
        .sort()
        .reverse();
      
      // Delete old rotated logs beyond max
      for (let i = CONFIG.maxRotatedLogs; i < rotatedFiles.length; i++) {
        await fs.unlink(path.join(dir, rotatedFiles[i]));
      }
    }
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

/**
 * Write error to log files
 */
async function writeToLogs(entry) {
  // Rotate logs if needed
  await rotateLogIfNeeded(ERROR_LOG);
  await rotateLogIfNeeded(ERROR_JSON_LOG);
  
  // Human-readable log
  const logLine = `[${entry.timestamp}] [${entry.severity}] [${entry.category}] ${entry.message}\n`;
  await fs.appendFile(ERROR_LOG, logLine);
  
  // JSON log for parsing
  const jsonLine = JSON.stringify(entry) + '\n';
  await fs.appendFile(ERROR_JSON_LOG, jsonLine);
}

/**
 * Track error for deduplication and alerting
 */
function trackError(entry) {
  const fingerprint = getErrorFingerprint(entry);
  const now = Date.now();
  
  // Clean up old entries (older than 1 hour)
  for (const [key, timestamp] of errorCache.entries()) {
    if (now - timestamp > 3600000) {
      errorCache.delete(key);
      errorCounts.delete(key);
    }
  }
  
  // Track this error
  errorCache.set(fingerprint, now);
  errorCounts.set(fingerprint, (errorCounts.get(fingerprint) || 0) + 1);
}

/**
 * Main logging function
 */
export async function log(message, options = {}) {
  const entry = createErrorEntry(message, options);
  
  // Track error
  trackError(entry);
  
  // Write to logs
  await writeToLogs(entry);
  
  // Check if alert should be sent
  if (shouldAlert(entry)) {
    await sendAlert(entry);
  }
  
  // Console output for development
  if (entry.severity === Severity.ERROR || entry.severity === Severity.FATAL) {
    console.error(`[${entry.severity}] ${entry.message}`);
    if (entry.stack) {
      console.error(entry.stack);
    }
  }
}

/**
 * Convenience functions for different severity levels
 */
export async function logDebug(message, options = {}) {
  return log(message, { ...options, severity: Severity.DEBUG });
}

export async function logInfo(message, options = {}) {
  return log(message, { ...options, severity: Severity.INFO });
}

export async function logWarning(message, options = {}) {
  return log(message, { ...options, severity: Severity.WARN });
}

export async function logError(message, options = {}) {
  return log(message, { ...options, severity: Severity.ERROR });
}

export async function logFatal(message, options = {}) {
  return log(message, { ...options, severity: Severity.FATAL });
}

/**
 * Get error statistics
 */
export async function getErrorStats(hoursBack = 24) {
  try {
    const content = await fs.readFile(ERROR_JSON_LOG, 'utf-8');
    const lines = content.trim().split('\n');
    
    const cutoffTime = Date.now() - (hoursBack * 3600000);
    const recentErrors = lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry && new Date(entry.timestamp).getTime() > cutoffTime);
    
    const stats = {
      total: recentErrors.length,
      bySeverity: {},
      byCategory: {},
      recentErrors: recentErrors.slice(-10),
    };
    
    for (const entry of recentErrors) {
      stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
    }
    
    return stats;
  } catch (error) {
    return { total: 0, bySeverity: {}, byCategory: {}, recentErrors: [] };
  }
}

/**
 * CLI for viewing error logs
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'stats':
      const hours = parseInt(process.argv[3]) || 24;
      const stats = await getErrorStats(hours);
      console.log(`\nError Statistics (last ${hours} hours):`);
      console.log(`Total errors: ${stats.total}`);
      console.log('\nBy Severity:');
      console.log(stats.bySeverity);
      console.log('\nBy Category:');
      console.log(stats.byCategory);
      console.log('\nRecent Errors:');
      stats.recentErrors.forEach(e => {
        console.log(`  [${e.timestamp}] [${e.severity}] ${e.message}`);
      });
      break;
    
    case 'tail':
      const n = parseInt(process.argv[3]) || 20;
      const content = await fs.readFile(ERROR_LOG, 'utf-8');
      const lines = content.trim().split('\n');
      console.log(lines.slice(-n).join('\n'));
      break;
    
    case 'clear':
      await fs.writeFile(ERROR_LOG, '');
      await fs.writeFile(ERROR_JSON_LOG, '');
      await fs.writeFile(ALERT_LOG, '');
      console.log('Error logs cleared');
      break;
    
    default:
      console.log('Usage:');
      console.log('  node scripts/error-logger.mjs stats [hours]  # Show error statistics');
      console.log('  node scripts/error-logger.mjs tail [n]       # Show last N errors');
      console.log('  node scripts/error-logger.mjs clear          # Clear all logs');
      break;
  }
}
