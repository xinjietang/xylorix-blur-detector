/**
 * Native module bridge for blur detection
 */

import { NativeModules, Platform } from 'react-native';
import { BlurDetectorNativeModule } from './types/native';
import { logger } from './utils/logger';

/**
 * Access the native BlurDetector module
 */
const BlurDetectorModule = NativeModules.BlurDetector as BlurDetectorNativeModule | undefined;

if (!BlurDetectorModule) {
  logger.error('BlurDetector native module is not available. Make sure native code is properly linked.');
}

/**
 * Check if blur detector is available
 */
export function isBlurDetectorAvailable(): boolean {
  return BlurDetectorModule !== undefined && BlurDetectorModule !== null;
}

/**
 * Get platform-specific implementation details
 */
export function getPlatformInfo(): { platform: string; available: boolean } {
  return {
    platform: Platform.OS,
    available: isBlurDetectorAvailable(),
  };
}

/**
 * Export the native module for direct access if needed
 */
export default BlurDetectorModule;
