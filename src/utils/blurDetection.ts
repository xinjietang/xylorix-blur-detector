/**
 * Blur detection utility functions
 */

import {
  BlurMetrics,
  BlurStatus,
  BlurDetectionConfig,
  NativeBlurResult,
  PartialBlurDetectionConfig,
  SensitivityLevel,
} from '../types/blur';
import {
  DEFAULT_BLUR_CONFIG,
  BLUR_STATUS_THRESHOLDS,
  SENSITIVITY_THRESHOLDS,
  DEFAULT_ALGORITHM_WEIGHTS,
  MAX_FRAME_SKIP_RATE,
  MIN_FRAME_SKIP_RATE,
} from './constants';
import { logger } from './logger';

/**
 * Determine blur status based on overall score
 */
export function getBlurStatus(overallScore: number): BlurStatus {
  if (overallScore < BLUR_STATUS_THRESHOLDS.VERY_BLURRY) {
    return 'very-blurry';
  } else if (overallScore < BLUR_STATUS_THRESHOLDS.SLIGHTLY_BLURRY) {
    return 'slightly-blurry';
  }
  return 'clear';
}

/**
 * Check if image is considered blurry based on threshold
 */
export function isImageBlurry(overallScore: number, threshold: number): boolean {
  return overallScore < threshold;
}

/**
 * Calculate weighted overall score from individual algorithm scores
 */
export function calculateOverallScore(
  fftScore: number,
  sobelScore: number,
  laplacianScore: number,
  weights: BlurDetectionConfig['algorithmWeights'] = DEFAULT_ALGORITHM_WEIGHTS
): number {
  const w = weights || DEFAULT_ALGORITHM_WEIGHTS;
  return fftScore * w.fft + sobelScore * w.sobel + laplacianScore * w.laplacian;
}

/**
 * Convert native blur result to full BlurMetrics object
 */
export function createBlurMetrics(
  nativeResult: NativeBlurResult,
  config: BlurDetectionConfig
): BlurMetrics {
  const { fftScore, sobelScore, laplacianScore, overallScore, processingTimeMs } = nativeResult;
  
  const status = getBlurStatus(overallScore);
  const isBlurry = isImageBlurry(overallScore, config.threshold);
  const timestamp = Date.now();

  return {
    fftScore,
    sobelScore,
    laplacianScore,
    overallScore,
    status,
    isBlurry,
    processingTimeMs,
    timestamp,
  };
}

/**
 * Merge partial configuration with defaults
 */
export function mergeBlurConfig(
  partialConfig: PartialBlurDetectionConfig
): BlurDetectionConfig {
  const config: BlurDetectionConfig = {
    ...DEFAULT_BLUR_CONFIG,
    ...partialConfig,
  };

  // If sensitivity is provided, update threshold accordingly
  if (partialConfig.sensitivity) {
    config.threshold = SENSITIVITY_THRESHOLDS[partialConfig.sensitivity];
  }

  // Validate and clamp frame skip rate
  if (config.frameSkipRate < MIN_FRAME_SKIP_RATE) {
    logger.warn(`Frame skip rate ${config.frameSkipRate} is below minimum, setting to ${MIN_FRAME_SKIP_RATE}`);
    config.frameSkipRate = MIN_FRAME_SKIP_RATE;
  }
  if (config.frameSkipRate > MAX_FRAME_SKIP_RATE) {
    logger.warn(`Frame skip rate ${config.frameSkipRate} exceeds maximum, setting to ${MAX_FRAME_SKIP_RATE}`);
    config.frameSkipRate = MAX_FRAME_SKIP_RATE;
  }

  // Validate algorithm weights if provided
  if (config.algorithmWeights) {
    const sum = config.algorithmWeights.fft + config.algorithmWeights.sobel + config.algorithmWeights.laplacian;
    if (Math.abs(sum - 1.0) > 0.01) {
      logger.warn(`Algorithm weights sum to ${sum}, expected 1.0. Using default weights.`);
      config.algorithmWeights = DEFAULT_ALGORITHM_WEIGHTS;
    }
  }

  return config;
}

/**
 * Validate blur detection configuration
 */
export function validateConfig(config: BlurDetectionConfig): boolean {
  if (config.threshold < 0 || config.threshold > 1) {
    logger.error(`Invalid threshold: ${config.threshold}. Must be between 0 and 1.`);
    return false;
  }

  if (!['low', 'medium', 'high'].includes(config.sensitivity)) {
    logger.error(`Invalid sensitivity: ${config.sensitivity}`);
    return false;
  }

  if (config.frameSkipRate < MIN_FRAME_SKIP_RATE || config.frameSkipRate > MAX_FRAME_SKIP_RATE) {
    logger.error(`Invalid frame skip rate: ${config.frameSkipRate}`);
    return false;
  }

  return true;
}

/**
 * Format blur metrics for display
 */
export function formatBlurMetrics(metrics: BlurMetrics): string {
  return `FFT: ${(metrics.fftScore * 100).toFixed(1)}% | ` +
         `Sobel: ${(metrics.sobelScore * 100).toFixed(1)}% | ` +
         `Laplacian: ${(metrics.laplacianScore * 100).toFixed(1)}% | ` +
         `Overall: ${(metrics.overallScore * 100).toFixed(1)}% (${metrics.status})`;
}

/**
 * Calculate FPS from frame timestamps
 */
export function calculateFPS(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  
  const recentTimestamps = timestamps.slice(-10); // Use last 10 frames
  const timeDiffs = [];
  
  for (let i = 1; i < recentTimestamps.length; i++) {
    timeDiffs.push(recentTimestamps[i] - recentTimestamps[i - 1]);
  }
  
  const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
  return avgTimeDiff > 0 ? 1000 / avgTimeDiff : 0;
}
