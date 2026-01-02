/**
 * Blur detection type definitions
 */

/**
 * Blur status categorization
 */
export type BlurStatus = 'clear' | 'slightly-blurry' | 'very-blurry';

/**
 * Sensitivity preset levels for blur detection
 */
export type SensitivityLevel = 'low' | 'medium' | 'high';

/**
 * Comprehensive blur metrics from all three algorithms
 */
export interface BlurMetrics {
  /** FFT (Fast Fourier Transform) score: 0-1 where lower = more blur */
  fftScore: number;
  
  /** Sobel operator score: 0-1 where lower = more blur */
  sobelScore: number;
  
  /** Laplacian operator score: 0-1 where lower = more blur */
  laplacianScore: number;
  
  /** Overall blur score (weighted average of above): 0-1 where lower = more blur */
  overallScore: number;
  
  /** Categorized blur status */
  status: BlurStatus;
  
  /** Boolean indicator if image is considered blurry based on threshold */
  isBlurry: boolean;
  
  /** Time taken to process the frame in milliseconds */
  processingTimeMs: number;
  
  /** Timestamp when the frame was analyzed */
  timestamp: number;
}

/**
 * Configuration options for blur detection
 */
export interface BlurDetectionConfig {
  /** 
   * Blur threshold: 0-1, default 0.4
   * If overallScore < threshold, image is considered blurry
   */
  threshold: number;
  
  /** 
   * Sensitivity preset level affecting threshold
   * - low: threshold 0.3 (more lenient)
   * - medium: threshold 0.4 (balanced)
   * - high: threshold 0.5 (more strict)
   */
  sensitivity: SensitivityLevel;
  
  /** 
   * Process every Nth frame (1-5)
   * Higher values = better performance, less frequent updates
   * Default: 1 (process every frame)
   */
  frameSkipRate: number;
  
  /** 
   * Optional custom weights for each algorithm (must sum to 1.0)
   * Default: equal weights of 0.33 each
   */
  algorithmWeights?: {
    fft: number;
    sobel: number;
    laplacian: number;
  };
}

/**
 * Partial configuration allowing runtime updates
 */
export type PartialBlurDetectionConfig = Partial<BlurDetectionConfig>;

/**
 * Native module blur result structure
 */
export interface NativeBlurResult {
  fftScore: number;
  sobelScore: number;
  laplacianScore: number;
  overallScore: number;
  processingTimeMs: number;
}
