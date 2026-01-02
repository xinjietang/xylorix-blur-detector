/**
 * Native module type definitions for blur detection
 */

import { NativeBlurResult } from './blur';

/**
 * Native blur detector module interface
 */
export interface BlurDetectorNativeModule {
  /**
   * Analyzes an image buffer for blur using FFT, Sobel, and Laplacian algorithms
   * @param imageBuffer - Raw image data buffer
   * @param width - Image width in pixels
   * @param height - Image height in pixels
   * @returns Promise with blur detection results
   */
  analyzeBlur(
    imageBuffer: ArrayBuffer,
    width: number,
    height: number
  ): Promise<NativeBlurResult>;

  /**
   * Analyzes blur from a frame processor (Vision Camera worklet context)
   * @param frame - Vision Camera frame object
   * @returns Native blur result
   */
  detectBlur(frame: any): NativeBlurResult;
}

/**
 * Frame processor function type for blur detection
 */
export type BlurDetectorFrameProcessor = (frame: any) => NativeBlurResult | null;
