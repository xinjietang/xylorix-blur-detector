/**
 * Logger utility for debugging and diagnostics
 */

import { LogLevel, DEFAULT_LOG_LEVEL } from './constants';

/**
 * Simple logger class with configurable log levels
 */
class Logger {
  private logLevel: LogLevel = DEFAULT_LOG_LEVEL;

  /**
   * Set the logging level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log error message
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  /**
   * Log blur metrics for debugging
   */
  logBlurMetrics(metrics: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log('[BLUR METRICS]', {
        fft: metrics.fftScore?.toFixed(3),
        sobel: metrics.sobelScore?.toFixed(3),
        laplacian: metrics.laplacianScore?.toFixed(3),
        overall: metrics.overallScore?.toFixed(3),
        status: metrics.status,
        processingTime: `${metrics.processingTimeMs?.toFixed(2)}ms`,
      });
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(fps: number, processingTime: number): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log('[PERFORMANCE]', {
        fps: fps.toFixed(1),
        processingTime: `${processingTime.toFixed(2)}ms`,
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for custom instances
export default Logger;
