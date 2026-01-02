# API Reference

Complete API documentation for Xylorix Blur Detector.

## Table of Contents

- [Types](#types)
- [Components](#components)
- [Utilities](#utilities)
- [Native Modules](#native-modules)
- [Constants](#constants)

## Types

### BlurMetrics

Complete blur detection result including all algorithm scores.

```typescript
interface BlurMetrics {
  fftScore: number;          // FFT algorithm score (0-1, lower = more blur)
  sobelScore: number;        // Sobel algorithm score (0-1, lower = more blur)
  laplacianScore: number;    // Laplacian algorithm score (0-1, lower = more blur)
  overallScore: number;      // Weighted average of all scores (0-1)
  status: BlurStatus;        // Categorized blur status
  isBlurry: boolean;         // Boolean indicator based on threshold
  processingTimeMs: number;  // Processing time in milliseconds
  timestamp: number;         // Unix timestamp when analyzed
}
```

### BlurStatus

Categorized blur status enum.

```typescript
type BlurStatus = 'clear' | 'slightly-blurry' | 'very-blurry';
```

**Thresholds**:
- `clear`: overallScore >= 0.5
- `slightly-blurry`: 0.3 <= overallScore < 0.5
- `very-blurry`: overallScore < 0.3

### BlurDetectionConfig

Configuration options for blur detection.

```typescript
interface BlurDetectionConfig {
  threshold: number;         // Blur threshold (0-1), default: 0.4
  sensitivity: SensitivityLevel;  // Preset sensitivity level
  frameSkipRate: number;     // Process every Nth frame (1-5), default: 1
  algorithmWeights?: {       // Custom algorithm weights (must sum to 1.0)
    fft: number;
    sobel: number;
    laplacian: number;
  };
}
```

### SensitivityLevel

Sensitivity preset options.

```typescript
type SensitivityLevel = 'low' | 'medium' | 'high';
```

**Preset Thresholds**:
- `low`: 0.3 (more lenient, detects only heavily blurred images)
- `medium`: 0.4 (balanced, good general purpose)
- `high`: 0.5 (strict, flags slightly blurred images)

## Components

### CameraScreen

Main camera component with blur detection frame processor.

```typescript
interface CameraScreenProps {
  config: BlurDetectionConfig;
  onBlurMetricsUpdate: (metrics: BlurMetrics) => void;
  onFPSUpdate: (fps: number) => void;
}

const CameraScreen: React.FC<CameraScreenProps>;
```

**Usage**:
```typescript
<CameraScreen
  config={config}
  onBlurMetricsUpdate={(metrics) => console.log(metrics)}
  onFPSUpdate={(fps) => console.log(`FPS: ${fps}`)}
/>
```

### BlurIndicator

Visual indicator showing blur status with color coding.

```typescript
interface BlurIndicatorProps {
  status: BlurStatus;
  overallScore: number;
  isBlurry: boolean;
}

const BlurIndicator: React.FC<BlurIndicatorProps>;
```

**Colors**:
- Clear: Green (#4CAF50)
- Slightly Blurry: Yellow (#FFC107)
- Very Blurry: Red (#F44336)

**Usage**:
```typescript
<BlurIndicator
  status={metrics.status}
  overallScore={metrics.overallScore}
  isBlurry={metrics.isBlurry}
/>
```

### MetricsDisplay

Detailed metrics display component.

```typescript
interface MetricsDisplayProps {
  metrics: BlurMetrics | null;
  fps: number;
}

const MetricsDisplay: React.FC<MetricsDisplayProps>;
```

**Usage**:
```typescript
<MetricsDisplay metrics={metrics} fps={fps} />
```

### PermissionHandler

Camera permission request and handling component.

```typescript
interface PermissionHandlerProps {
  onPermissionGranted: () => void;
  children: React.ReactNode;
}

const PermissionHandler: React.FC<PermissionHandlerProps>;
```

**Usage**:
```typescript
<PermissionHandler onPermissionGranted={() => console.log('Granted')}>
  <CameraScreen {...props} />
</PermissionHandler>
```

## Utilities

### blurDetection.ts

Utility functions for blur detection calculations.

#### `getBlurStatus(overallScore: number): BlurStatus`

Determine blur status from overall score.

```typescript
const status = getBlurStatus(0.45); // Returns 'slightly-blurry'
```

#### `isImageBlurry(overallScore: number, threshold: number): boolean`

Check if image is blurry based on threshold.

```typescript
const blurry = isImageBlurry(0.35, 0.4); // Returns true
```

#### `calculateOverallScore(...): number`

Calculate weighted overall score from individual algorithms.

```typescript
const overall = calculateOverallScore(0.4, 0.5, 0.45, {
  fft: 0.4,
  sobel: 0.3,
  laplacian: 0.3
}); // Returns weighted average
```

#### `createBlurMetrics(...): BlurMetrics`

Convert native result to full BlurMetrics object.

```typescript
const metrics = createBlurMetrics(nativeResult, config);
```

#### `mergeBlurConfig(partial: PartialBlurDetectionConfig): BlurDetectionConfig`

Merge partial config with defaults and validate.

```typescript
const config = mergeBlurConfig({
  sensitivity: 'high',
  frameSkipRate: 2
});
```

#### `validateConfig(config: BlurDetectionConfig): boolean`

Validate configuration parameters.

```typescript
const isValid = validateConfig(config); // Returns true/false
```

#### `formatBlurMetrics(metrics: BlurMetrics): string`

Format metrics for display.

```typescript
const formatted = formatBlurMetrics(metrics);
// Returns: "FFT: 45.0% | Sobel: 50.0% | Laplacian: 48.0% | Overall: 47.7% (slightly-blurry)"
```

#### `calculateFPS(timestamps: number[]): number`

Calculate FPS from frame timestamps.

```typescript
const fps = calculateFPS(timestamps); // Returns FPS value
```

### logger.ts

Logging utility with configurable log levels.

```typescript
import { logger, LogLevel } from './utils/logger';

// Set log level
logger.setLogLevel(LogLevel.DEBUG);

// Log methods
logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', error);

// Specialized logging
logger.logBlurMetrics(metrics);
logger.logPerformance(fps, processingTime);
```

## Native Modules

### BlurDetectorModule

Native module for blur detection.

#### iOS (Swift)

```swift
@objc(BlurDetector)
class BlurDetector: NSObject {
  @objc func detectBlur(_ frame: NSDictionary) -> NSDictionary
  @objc func analyzeBlur(_ imageBuffer: Data, width: NSNumber, height: NSNumber, 
                         resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
}
```

#### Android (Kotlin)

```kotlin
@ReactModule(name = "BlurDetector")
class BlurDetectorModule : ReactContextBaseJavaModule {
  @ReactMethod(isBlockingSynchronousMethod = true)
  fun detectBlur(frame: ReadableMap): WritableMap
  
  @ReactMethod
  fun analyzeBlur(imageBuffer: ReadableArray, width: Int, height: Int, promise: Promise)
}
```

#### JavaScript Interface

```typescript
interface BlurDetectorNativeModule {
  detectBlur(frame: any): NativeBlurResult;
  analyzeBlur(imageBuffer: ArrayBuffer, width: number, height: number): Promise<NativeBlurResult>;
}
```

**Usage**:
```typescript
import BlurDetectorModule from './NativeModules';

// In frame processor (synchronous)
const result = BlurDetectorModule.detectBlur(frame);

// Standalone analysis (asynchronous)
const result = await BlurDetectorModule.analyzeBlur(buffer, width, height);
```

## Constants

### Default Configuration

```typescript
const DEFAULT_BLUR_CONFIG: BlurDetectionConfig = {
  threshold: 0.4,
  sensitivity: 'medium',
  frameSkipRate: 1,
  algorithmWeights: {
    fft: 0.33,
    sobel: 0.34,
    laplacian: 0.33,
  },
};
```

### Sensitivity Thresholds

```typescript
const SENSITIVITY_THRESHOLDS = {
  low: 0.3,
  medium: 0.4,
  high: 0.5,
};
```

### Blur Status Thresholds

```typescript
const BLUR_STATUS_THRESHOLDS = {
  VERY_BLURRY: 0.3,    // Below this = very blurry
  SLIGHTLY_BLURRY: 0.5, // Below this = slightly blurry, above = clear
};
```

### Processing Settings

```typescript
const TARGET_FPS = 30;
const MAX_FRAME_SKIP_RATE = 5;
const MIN_FRAME_SKIP_RATE = 1;

const PROCESSING_RESOLUTION = {
  width: 640,
  height: 480,
};
```

### UI Colors

```typescript
const BLUR_INDICATOR_COLORS = {
  clear: '#4CAF50',        // Green
  slightlyBlurry: '#FFC107', // Yellow
  veryBlurry: '#F44336',   // Red
};
```

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}
```

## Error Handling

All methods handle errors gracefully:

```typescript
// Native module unavailable
if (!BlurDetectorModule) {
  console.error('BlurDetector native module not available');
  // Show fallback UI
}

// Frame processor error
try {
  const result = BlurDetectorModule.detectBlur(frame);
} catch (error) {
  logger.error('Frame processing error:', error);
  // Continue without crashing
}
```

## Performance Considerations

- **Frame Skip Rate**: Increase to improve performance on lower-end devices
- **Resolution**: Images automatically resized to 640x480 for processing
- **Algorithm Weights**: Set unused algorithms to 0 weight for better performance
- **Target FPS**: Aim for 30 FPS on mid-range devices

## Platform Differences

### iOS
- Uses Accelerate framework for FFT
- Uses Core Image for Sobel and Laplacian
- Requires iOS 13+

### Android
- Simplified FFT implementation for mobile
- Custom kernel convolution for Sobel and Laplacian
- Requires API 21+

## Examples

See the complete working example in `src/App.tsx` and `src/screens/BlurDetectorScreen.tsx`.

For more information, visit the [GitHub repository](https://github.com/xinjietang/xylorix-blur-detector).
