# Performance Tuning Guide

Optimize Xylorix Blur Detector for your specific use case and device requirements.

## Table of Contents

- [Understanding Performance Metrics](#understanding-performance-metrics)
- [Optimization Strategies](#optimization-strategies)
- [Device-Specific Tuning](#device-specific-tuning)
- [Algorithm Selection](#algorithm-selection)
- [Memory Optimization](#memory-optimization)
- [Benchmarking](#benchmarking)

## Understanding Performance Metrics

### Key Metrics

1. **FPS (Frames Per Second)**
   - Target: 30 FPS
   - Good: 25-30 FPS
   - Acceptable: 20-25 FPS
   - Poor: < 20 FPS

2. **Processing Time**
   - Target: < 33ms (for 30 FPS)
   - Good: 10-30ms
   - Acceptable: 30-50ms
   - Poor: > 50ms

3. **Memory Usage**
   - Target: < 50MB
   - Good: 50-100MB
   - Acceptable: 100-150MB
   - Poor: > 150MB

### Monitoring Performance

```typescript
import { logger, LogLevel } from './utils/logger';

// Enable debug logging
logger.setLogLevel(LogLevel.DEBUG);

// Logs will show:
// [PERFORMANCE] fps: 28.5, processingTime: 25.3ms
// [BLUR METRICS] fft: 0.456, sobel: 0.512, laplacian: 0.489
```

## Optimization Strategies

### 1. Frame Skip Rate

**Impact**: Reduces processing frequency, improves FPS

```typescript
// Default (process every frame)
frameSkipRate: 1  // 30 FPS target

// Moderate optimization
frameSkipRate: 2  // ~15 updates/sec, better performance

// Aggressive optimization
frameSkipRate: 3-5  // ~6-10 updates/sec, best performance
```

**When to Use**:
- Low-end devices: 3-5
- Mid-range devices: 2-3
- High-end devices: 1-2

### 2. Algorithm Selection

**Performance Impact** (from most to least expensive):
1. FFT (Fast Fourier Transform) - Most expensive
2. Laplacian Operator - Moderate
3. Sobel Operator - Least expensive

**Disable Expensive Algorithms**:

```typescript
// Disable FFT for better performance
algorithmWeights: {
  fft: 0.0,        // Disabled
  sobel: 0.5,      // 50% weight
  laplacian: 0.5,  // 50% weight
}

// Use only Sobel (fastest)
algorithmWeights: {
  fft: 0.0,
  sobel: 1.0,      // 100% weight
  laplacian: 0.0,
}
```

### 3. Resolution Optimization

Images are automatically resized to 640x480 for processing. You can modify this in the native code:

**iOS** (`src/native/ios/BlurDetector.swift`):
```swift
let resizedImage = resizeImage(image, targetWidth: 480)  // Lower resolution
```

**Android** (`src/native/android/BlurDetectorModule.kt`):
```kotlin
val resizedBitmap = resizeBitmap(bitmap, 480)  // Lower resolution
```

**Resolution vs Performance**:
- 640x480 (default): Good balance
- 480x360: Better performance, slightly less accurate
- 320x240: Best performance, reduced accuracy

### 4. Sensitivity Presets

Lower sensitivity = faster processing:

```typescript
sensitivity: 'low',  // threshold: 0.3, more lenient
```

## Device-Specific Tuning

### Low-End Devices (< 2GB RAM)

```typescript
const lowEndConfig = {
  threshold: 0.3,
  sensitivity: 'low',
  frameSkipRate: 5,  // Process every 5th frame
  algorithmWeights: {
    fft: 0.0,        // Disable FFT
    sobel: 1.0,      // Use only Sobel
    laplacian: 0.0,
  },
};
```

**Expected Performance**:
- FPS: 25-30
- Updates: ~6/second
- Processing time: 15-25ms

### Mid-Range Devices (2-4GB RAM)

```typescript
const midRangeConfig = {
  threshold: 0.4,
  sensitivity: 'medium',
  frameSkipRate: 2,  // Process every 2nd frame
  algorithmWeights: {
    fft: 0.0,        // Disable FFT
    sobel: 0.5,
    laplacian: 0.5,
  },
};
```

**Expected Performance**:
- FPS: 28-30
- Updates: ~15/second
- Processing time: 20-35ms

### High-End Devices (> 4GB RAM)

```typescript
const highEndConfig = {
  threshold: 0.4,
  sensitivity: 'high',
  frameSkipRate: 1,  // Process every frame
  algorithmWeights: {
    fft: 0.33,       // Use all algorithms
    sobel: 0.34,
    laplacian: 0.33,
  },
};
```

**Expected Performance**:
- FPS: 30
- Updates: 30/second
- Processing time: 25-40ms

## Algorithm Selection

### Choose Based on Use Case

#### Document Scanning
Best accuracy, less concerned about speed:

```typescript
{
  frameSkipRate: 2,
  algorithmWeights: {
    fft: 0.4,        // Emphasize frequency analysis
    sobel: 0.3,
    laplacian: 0.3,
  },
}
```

#### Real-Time Video Analysis
Speed is critical:

```typescript
{
  frameSkipRate: 3,
  algorithmWeights: {
    fft: 0.0,
    sobel: 1.0,      // Use fastest algorithm only
    laplacian: 0.0,
  },
}
```

#### Quality Control / Inspection
Balance accuracy and speed:

```typescript
{
  frameSkipRate: 2,
  algorithmWeights: {
    fft: 0.0,        // Disable most expensive
    sobel: 0.5,
    laplacian: 0.5,  // Use two algorithms
  },
}
```

## Memory Optimization

### iOS Optimization

The iOS implementation uses `autoreleasepool` to manage memory:

```swift
autoreleasepool {
    // Processing code
}
```

**Additional Optimizations**:
1. Ensure images are properly released after processing
2. Use lower resolution for processing
3. Monitor memory with Xcode Instruments

### Android Optimization

Kotlin implementation recycles bitmaps:

```kotlin
resizedBitmap.recycle()
bitmap.recycle()
```

**Additional Optimizations**:
1. Process on background thread (already implemented)
2. Use smaller bitmaps
3. Monitor with Android Profiler

### React Native Optimization

```typescript
// Clean up on unmount
useEffect(() => {
  return () => {
    // Cleanup code
  };
}, []);
```

## Benchmarking

### Measure Processing Time

```typescript
const [avgProcessingTime, setAvgProcessingTime] = useState(0);
const processingTimes = useRef<number[]>([]);

const handleBlurUpdate = (metrics: BlurMetrics) => {
  // Track processing times
  processingTimes.current.push(metrics.processingTimeMs);
  
  // Keep last 30 samples
  if (processingTimes.current.length > 30) {
    processingTimes.current.shift();
  }
  
  // Calculate average
  const avg = processingTimes.current.reduce((a, b) => a + b, 0) / 
              processingTimes.current.length;
  setAvgProcessingTime(avg);
};
```

### Benchmark Different Configurations

```typescript
const benchmarkConfigs = [
  { name: 'All Algorithms', config: { /* ... */ } },
  { name: 'No FFT', config: { /* ... */ } },
  { name: 'Sobel Only', config: { /* ... */ } },
];

// Test each configuration and compare results
```

## Performance Checklist

Before deploying:

- [ ] Test on low-end device
- [ ] Test on mid-range device
- [ ] Test on high-end device
- [ ] Monitor FPS (should be ≥ 25)
- [ ] Check processing time (should be < 40ms)
- [ ] Monitor memory usage
- [ ] Test for extended periods (10+ minutes)
- [ ] Verify no memory leaks
- [ ] Test different lighting conditions
- [ ] Benchmark all three algorithms
- [ ] Compare with/without FFT

## Quick Optimization Guide

| Issue | Solution | Config Change |
|-------|----------|--------------|
| Low FPS (< 20) | Increase frame skip | `frameSkipRate: 3-5` |
| High processing time | Disable FFT | `fft: 0.0` |
| Memory issues | Lower resolution | Modify native code |
| Inaccurate results | Enable all algorithms | Default weights |
| Too sensitive | Lower threshold | `threshold: 0.3` |
| Not sensitive enough | Raise threshold | `threshold: 0.5` |

## Platform-Specific Tips

### iOS
- Use Instruments to profile
- Monitor with Activity Monitor
- Test on older iPhone models (iPhone 8, X)
- Verify Metal support for Core Image

### Android
- Use Android Profiler
- Test on various API levels (21-34)
- Check for different GPU capabilities
- Monitor battery usage

## Recommended Configurations

### Default (Balanced)
```typescript
{
  threshold: 0.4,
  sensitivity: 'medium',
  frameSkipRate: 1,
  algorithmWeights: { fft: 0.33, sobel: 0.34, laplacian: 0.33 }
}
```

### Performance (Fast)
```typescript
{
  threshold: 0.4,
  sensitivity: 'medium',
  frameSkipRate: 3,
  algorithmWeights: { fft: 0.0, sobel: 1.0, laplacian: 0.0 }
}
```

### Accuracy (Slow but Precise)
```typescript
{
  threshold: 0.45,
  sensitivity: 'high',
  frameSkipRate: 1,
  algorithmWeights: { fft: 0.4, sobel: 0.3, laplacian: 0.3 }
}
```

---

For more information, see:
- [Setup Guide](SETUP.md) for development setup
- [API Reference](API.md) for detailed configuration options
- [Examples](EXAMPLES.md) for usage patterns
