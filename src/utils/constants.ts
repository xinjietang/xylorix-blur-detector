/**
 * Constants for blur detection configuration
 */

import { BlurDetectionConfig, SensitivityLevel } from '../types/blur';

/**
 * Default blur threshold values for different sensitivity levels
 */
export const SENSITIVITY_THRESHOLDS: Record<SensitivityLevel, number> = {
  low: 0.3,    // More lenient - detects only heavily blurred images
  medium: 0.4, // Balanced - good general purpose threshold
  high: 0.5,   // Strict - flags slightly blurred images
};

/**
 * Default algorithm weights (equal weighting)
 */
export const DEFAULT_ALGORITHM_WEIGHTS = {
  fft: 0.33,
  sobel: 0.34,
  laplacian: 0.33,
};

/**
 * Default blur detection configuration
 */
export const DEFAULT_BLUR_CONFIG: BlurDetectionConfig = {
  threshold: SENSITIVITY_THRESHOLDS.medium,
  sensitivity: 'medium',
  frameSkipRate: 1, // Process every frame
  algorithmWeights: DEFAULT_ALGORITHM_WEIGHTS,
};

/**
 * Blur status thresholds
 * - Below 0.3: very blurry
 * - 0.3 to 0.5: slightly blurry
 * - Above 0.5: clear
 */
export const BLUR_STATUS_THRESHOLDS = {
  VERY_BLURRY: 0.3,
  SLIGHTLY_BLURRY: 0.5,
};

/**
 * Target processing frame rate
 */
export const TARGET_FPS = 30;

/**
 * Maximum frame skip rate allowed
 */
export const MAX_FRAME_SKIP_RATE = 5;

/**
 * Minimum frame skip rate allowed
 */
export const MIN_FRAME_SKIP_RATE = 1;

/**
 * Image processing resolution (for performance optimization)
 */
export const PROCESSING_RESOLUTION = {
  width: 640,
  height: 480,
};

/**
 * Blur indicator colors for UI
 */
export const BLUR_INDICATOR_COLORS = {
  clear: '#4CAF50',        // Green
  slightlyBlurry: '#FFC107', // Yellow
  veryBlurry: '#F44336',   // Red
};

/**
 * Logging levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Default log level
 */
export const DEFAULT_LOG_LEVEL = LogLevel.INFO;
