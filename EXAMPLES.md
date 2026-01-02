# Usage Examples

This guide provides practical examples of how to use Xylorix Blur Detector in your React Native applications.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Simple Integration](#simple-integration)
- [Custom Configuration](#custom-configuration)
- [Advanced Usage](#advanced-usage)
- [Common Patterns](#common-patterns)

## Basic Setup

### 1. Install the Package (Future npm package)

```bash
npm install xylorix-blur-detector
# or
yarn add xylorix-blur-detector
```

### 2. Link Native Modules

**iOS**:
```bash
cd ios && pod install && cd ..
```

**Android**: Gradle will handle linking automatically.

### 3. Add Permissions

The package handles permissions, but make sure your `Info.plist` (iOS) and `AndroidManifest.xml` (Android) have camera permissions configured.

## Simple Integration

### Example 1: Basic Blur Detection Screen

```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { BlurDetectorScreen } from 'xylorix-blur-detector';

export default function App() {
  return <BlurDetectorScreen />;
}
```

This gives you a complete blur detection interface with:
- Live camera preview
- Real-time blur detection
- Visual indicators
- Metrics display
- Sensitivity controls

### Example 2: Custom Blur Detection Component

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  CameraScreen,
  BlurIndicator,
  PermissionHandler,
  DEFAULT_BLUR_CONFIG,
} from 'xylorix-blur-detector';
import type { BlurMetrics } from 'xylorix-blur-detector';

export default function MyBlurDetector() {
  const [metrics, setMetrics] = useState<BlurMetrics | null>(null);
  const [fps, setFps] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  return (
    <PermissionHandler onPermissionGranted={() => setPermissionGranted(true)}>
      <View style={styles.container}>
        <CameraScreen
          config={DEFAULT_BLUR_CONFIG}
          onBlurMetricsUpdate={setMetrics}
          onFPSUpdate={setFps}
        />
        {metrics && (
          <View style={styles.overlay}>
            <BlurIndicator
              status={metrics.status}
              overallScore={metrics.overallScore}
              isBlurry={metrics.isBlurry}
            />
          </View>
        )}
      </View>
    </PermissionHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
  },
});
```

## Custom Configuration

### Example 3: High Sensitivity Detection

```typescript
import React from 'react';
import { CameraScreen } from 'xylorix-blur-detector';
import { mergeBlurConfig } from 'xylorix-blur-detector/utils';

export default function HighSensitivityDetector() {
  const config = mergeBlurConfig({
    sensitivity: 'high',  // Strict blur detection
    frameSkipRate: 1,     // Process every frame
  });

  return (
    <CameraScreen
      config={config}
      onBlurMetricsUpdate={(metrics) => {
        console.log('Blur detected:', metrics.isBlurry);
      }}
      onFPSUpdate={(fps) => {
        console.log('FPS:', fps);
      }}
    />
  );
}
```

### Example 4: Performance-Optimized Detection

```typescript
import React from 'react';
import { CameraScreen } from 'xylorix-blur-detector';
import { mergeBlurConfig } from 'xylorix-blur-detector/utils';

export default function PerformanceOptimizedDetector() {
  const config = mergeBlurConfig({
    sensitivity: 'medium',
    frameSkipRate: 3,  // Process every 3rd frame for better performance
    algorithmWeights: {
      fft: 0.0,        // Disable FFT (most expensive)
      sobel: 0.5,      // Focus on Sobel
      laplacian: 0.5,  // and Laplacian
    },
  });

  return (
    <CameraScreen
      config={config}
      onBlurMetricsUpdate={(metrics) => {
        // Will run less frequently but more efficiently
        if (metrics.isBlurry) {
          console.warn('Image is blurry!');
        }
      }}
      onFPSUpdate={(fps) => {
        console.log('FPS:', fps);  // Should be higher
      }}
    />
  );
}
```

### Example 5: Custom Algorithm Weights

```typescript
import React from 'react';
import { mergeBlurConfig } from 'xylorix-blur-detector/utils';

// Prioritize FFT for frequency-based blur detection
const fftFocusedConfig = mergeBlurConfig({
  threshold: 0.45,
  algorithmWeights: {
    fft: 0.6,        // 60% weight on FFT
    sobel: 0.2,      // 20% weight on Sobel
    laplacian: 0.2,  // 20% weight on Laplacian
  },
});

// Use in your component
<CameraScreen config={fftFocusedConfig} ... />
```

## Advanced Usage

### Example 6: Conditional Actions Based on Blur

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, Button } from 'react-native';
import { CameraScreen, DEFAULT_BLUR_CONFIG } from 'xylorix-blur-detector';
import type { BlurMetrics } from 'xylorix-blur-detector';

export default function AutoCaptureOnSharpness() {
  const [canCapture, setCanCapture] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<BlurMetrics | null>(null);

  const handleBlurUpdate = useCallback((metrics: BlurMetrics) => {
    setLastMetrics(metrics);
    
    // Only allow capture when image is sharp
    setCanCapture(!metrics.isBlurry && metrics.overallScore > 0.6);
    
    // Auto-capture if conditions are perfect
    if (metrics.overallScore > 0.8) {
      console.log('Perfect sharpness - auto-capturing!');
      // Trigger capture logic here
    }
  }, []);

  const handleCapture = () => {
    if (canCapture) {
      console.log('Capturing image with score:', lastMetrics?.overallScore);
      // Capture logic
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraScreen
        config={DEFAULT_BLUR_CONFIG}
        onBlurMetricsUpdate={handleBlurUpdate}
        onFPSUpdate={() => {}}
      />
      <View style={{ position: 'absolute', bottom: 50, alignSelf: 'center' }}>
        <Button
          title="Capture"
          onPress={handleCapture}
          disabled={!canCapture}
        />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          {canCapture ? 'Ready to capture!' : 'Focus to enable capture'}
        </Text>
      </View>
    </View>
  );
}
```

### Example 7: Logging and Analytics

```typescript
import React, { useCallback } from 'react';
import { CameraScreen } from 'xylorix-blur-detector';
import { logger, LogLevel } from 'xylorix-blur-detector/utils';
import type { BlurMetrics } from 'xylorix-blur-detector';

// Enable detailed logging
logger.setLogLevel(LogLevel.DEBUG);

export default function AnalyticsEnabledDetector() {
  const handleBlurUpdate = useCallback((metrics: BlurMetrics) => {
    // Log to console
    logger.logBlurMetrics(metrics);
    
    // Send to analytics service
    if (metrics.isBlurry) {
      // Track blur events
      analytics.track('blur_detected', {
        overall_score: metrics.overallScore,
        fft_score: metrics.fftScore,
        sobel_score: metrics.sobelScore,
        laplacian_score: metrics.laplacianScore,
        processing_time: metrics.processingTimeMs,
      });
    }
  }, []);

  const handleFPSUpdate = useCallback((fps: number) => {
    logger.logPerformance(fps, 0);
    
    // Track performance issues
    if (fps < 20) {
      analytics.track('low_fps', { fps });
    }
  }, []);

  return (
    <CameraScreen
      config={DEFAULT_BLUR_CONFIG}
      onBlurMetricsUpdate={handleBlurUpdate}
      onFPSUpdate={handleFPSUpdate}
    />
  );
}
```

### Example 8: Multiple Camera Positions

```typescript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { CameraScreen } from 'xylorix-blur-detector';

export default function MultiCameraDetector() {
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');

  // Toggle between front and back camera
  const toggleCamera = () => {
    setCameraPosition(prev => prev === 'back' ? 'front' : 'back');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Note: You'd need to customize CameraScreen to accept camera position */}
      <CameraScreen
        config={DEFAULT_BLUR_CONFIG}
        onBlurMetricsUpdate={(metrics) => console.log(metrics)}
        onFPSUpdate={(fps) => console.log(fps)}
      />
      <View style={{ position: 'absolute', top: 50, right: 20 }}>
        <Button title="Flip Camera" onPress={toggleCamera} />
      </View>
    </View>
  );
}
```

## Common Patterns

### Pattern 1: Debounced Blur Detection

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { BlurMetrics } from 'xylorix-blur-detector';

export function useDebouncedBlurDetection(delay: number = 500) {
  const [metrics, setMetrics] = useState<BlurMetrics | null>(null);
  const [debouncedMetrics, setDebouncedMetrics] = useState<BlurMetrics | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMetrics(metrics);
    }, delay);

    return () => clearTimeout(timer);
  }, [metrics, delay]);

  return {
    metrics: debouncedMetrics,
    updateMetrics: setMetrics,
  };
}

// Usage
function MyComponent() {
  const { metrics, updateMetrics } = useDebouncedBlurDetection(1000);

  return (
    <CameraScreen
      config={DEFAULT_BLUR_CONFIG}
      onBlurMetricsUpdate={updateMetrics}
      onFPSUpdate={() => {}}
    />
  );
}
```

### Pattern 2: Blur Threshold Alert

```typescript
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import type { BlurMetrics } from 'xylorix-blur-detector';

export function useBlurAlert(threshold: number = 0.3) {
  const [lastMetrics, setLastMetrics] = useState<BlurMetrics | null>(null);

  useEffect(() => {
    if (lastMetrics && lastMetrics.overallScore < threshold) {
      Alert.alert(
        'Image is Blurry',
        `Blur score: ${(lastMetrics.overallScore * 100).toFixed(1)}%\n` +
        'Please hold the device steady for better focus.',
        [{ text: 'OK' }]
      );
    }
  }, [lastMetrics, threshold]);

  return setLastMetrics;
}

// Usage
function MyComponent() {
  const handleBlurUpdate = useBlurAlert(0.3);

  return (
    <CameraScreen
      config={DEFAULT_BLUR_CONFIG}
      onBlurMetricsUpdate={handleBlurUpdate}
      onFPSUpdate={() => {}}
    />
  );
}
```

### Pattern 3: Blur History Tracking

```typescript
import { useState, useCallback } from 'react';
import type { BlurMetrics } from 'xylorix-blur-detector';

export function useBlurHistory(maxSize: number = 30) {
  const [history, setHistory] = useState<BlurMetrics[]>([]);

  const addMetrics = useCallback((metrics: BlurMetrics) => {
    setHistory(prev => {
      const newHistory = [...prev, metrics];
      return newHistory.slice(-maxSize);
    });
  }, [maxSize]);

  const getAverageScore = useCallback(() => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, m) => acc + m.overallScore, 0);
    return sum / history.length;
  }, [history]);

  return {
    history,
    addMetrics,
    getAverageScore,
  };
}

// Usage
function MyComponent() {
  const { history, addMetrics, getAverageScore } = useBlurHistory(30);

  return (
    <>
      <CameraScreen
        config={DEFAULT_BLUR_CONFIG}
        onBlurMetricsUpdate={addMetrics}
        onFPSUpdate={() => {}}
      />
      <Text>Average Score: {(getAverageScore() * 100).toFixed(1)}%</Text>
      <Text>Samples: {history.length}</Text>
    </>
  );
}
```

## Tips and Best Practices

1. **Start with default configuration** and adjust based on your needs
2. **Monitor FPS** to ensure smooth performance
3. **Use frame skip rate** on lower-end devices
4. **Disable expensive algorithms** if not needed
5. **Test on real devices** for accurate performance metrics
6. **Handle permission edge cases** properly
7. **Log metrics** during development for calibration
8. **Consider lighting conditions** when setting thresholds

## Next Steps

- Review the [API Documentation](./API.md) for detailed reference
- Check [SETUP.md](./SETUP.md) for platform-specific setup
- Contribute to the project via [CONTRIBUTING.md](./CONTRIBUTING.md)

Happy coding! 🚀
