# Xylorix Blur Detector

> Real-time blur detection for React Native using Vision Camera with FFT, Sobel, and Laplacian operators

[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
[![Vision Camera](https://img.shields.io/badge/Vision%20Camera-v3-green.svg)](https://github.com/mrousavy/react-native-vision-camera)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## Overview

Xylorix Blur Detector is a complete React Native application that provides real-time blur detection using Vision Camera frame processors. It combines three powerful algorithms to accurately measure image sharpness:

1. **FFT (Fast Fourier Transform)** - Analyzes frequency domain content to detect blur
2. **Sobel Operator** - Gradient-based edge detection for measuring sharpness
3. **Laplacian Operator** - Variance-based blur scoring using second derivatives

## Features

- ✨ **Real-time blur detection** at 30 FPS on mid-range devices
- 📊 **Multi-algorithm analysis** with individual scores from FFT, Sobel, and Laplacian
- 🎯 **Configurable sensitivity** with low, medium, and high presets
- 📱 **Native performance** with iOS (Swift + Accelerate) and Android (Kotlin) implementations
- 🎨 **Visual indicators** showing blur status with color-coded feedback
- 📈 **Performance metrics** including FPS and processing time
- 🔧 **Flexible configuration** with runtime-adjustable parameters
- 🛡️ **Type-safe** with comprehensive TypeScript definitions

## Demo

The app provides a live camera preview with:
- Real-time blur status indicator (green = clear, yellow = slightly blurry, red = very blurry)
- Individual algorithm scores (FFT, Sobel, Laplacian)
- Overall blur score and rating
- FPS counter and processing time
- Adjustable sensitivity settings

## Architecture

### Algorithm Overview

#### FFT (Fast Fourier Transform)
Analyzes the frequency domain of the image. Sharp images have more high-frequency content (edges and fine details), while blurry images have primarily low-frequency content. The FFT processor calculates the ratio of high-frequency to total energy.

**iOS Implementation**: Uses the Accelerate framework's vDSP for optimized 2D FFT
**Android Implementation**: Simplified gradient-based frequency analysis for mobile performance

#### Sobel Operator
Applies 3x3 convolution kernels to detect horizontal and vertical edges. The magnitude of the gradient indicates edge strength. Higher average edge magnitude means a sharper image.

**iOS Implementation**: Core Image's CIEdges filter with intensity measurement
**Android Implementation**: Custom 3x3 kernel convolution on grayscale bitmap

#### Laplacian Operator
Uses second derivative to measure local variance in the image. The Laplacian value at each pixel indicates how much it differs from its neighbors. Higher variance suggests sharper focus.

**iOS Implementation**: Core Image convolution filter with custom Laplacian kernel
**Android Implementation**: 3x3 Laplacian kernel applied to grayscale bitmap

### Technology Stack

- **React Native 0.73+** - Cross-platform mobile framework
- **React Native Vision Camera v3** - High-performance camera library with frame processors
- **TypeScript** - Type-safe development
- **Swift + Accelerate** (iOS) - Native blur detection with hardware-accelerated FFT
- **Kotlin + Coroutines** (Android) - Asynchronous native blur detection
- **Worklets** - JavaScript code running on camera frame processor thread

## Installation

### Prerequisites

- Node.js 18+
- React Native development environment set up for iOS and/or Android
- Xcode 14+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS dependencies)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/xinjietang/xylorix-blur-detector.git
   cd xylorix-blur-detector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   No additional steps needed - Gradle will handle dependencies

### Running the App

**iOS**:
```bash
npm run ios
```

**Android**:
```bash
npm run android
```

## Usage

### Basic Integration

```typescript
import { BlurDetectorScreen } from './src/screens/BlurDetectorScreen';

function App() {
  return <BlurDetectorScreen />;
}
```

### Custom Configuration

```typescript
import { BlurDetectionConfig } from './src/types/blur';
import { mergeBlurConfig } from './src/utils/blurDetection';

const customConfig: Partial<BlurDetectionConfig> = {
  threshold: 0.4,        // Blur threshold (0-1)
  sensitivity: 'high',   // 'low' | 'medium' | 'high'
  frameSkipRate: 2,      // Process every 2nd frame
  algorithmWeights: {
    fft: 0.4,
    sobel: 0.3,
    laplacian: 0.3,
  },
};

const config = mergeBlurConfig(customConfig);
```

### Using Components

```typescript
import { CameraScreen } from './src/components/CameraScreen';
import { BlurIndicator } from './src/components/BlurIndicator';
import { MetricsDisplay } from './src/components/MetricsDisplay';

function MyScreen() {
  const [metrics, setMetrics] = useState(null);
  const [fps, setFps] = useState(0);

  return (
    <>
      <CameraScreen
        config={config}
        onBlurMetricsUpdate={setMetrics}
        onFPSUpdate={setFps}
      />
      {metrics && (
        <>
          <BlurIndicator
            status={metrics.status}
            overallScore={metrics.overallScore}
            isBlurry={metrics.isBlurry}
          />
          <MetricsDisplay metrics={metrics} fps={fps} />
        </>
      )}
    </>
  );
}
```

## Configuration

### Blur Detection Config

```typescript
interface BlurDetectionConfig {
  threshold: number;         // 0-1, default 0.4
  sensitivity: SensitivityLevel;  // 'low' | 'medium' | 'high'
  frameSkipRate: number;     // 1-5, default 1
  algorithmWeights?: {
    fft: number;
    sobel: number;
    laplacian: number;
  };
}
```

### Sensitivity Presets

- **Low** (threshold 0.3): Only detects heavily blurred images
- **Medium** (threshold 0.4): Balanced detection (default)
- **High** (threshold 0.5): Flags slightly blurred images

### Algorithm Weights

Customize how much each algorithm contributes to the overall score. Weights must sum to 1.0.

Default weights:
```typescript
{
  fft: 0.33,
  sobel: 0.34,
  laplacian: 0.33
}
```

## API Reference

### BlurMetrics

```typescript
interface BlurMetrics {
  fftScore: number;          // 0-1 (lower = more blur)
  sobelScore: number;        // 0-1 (lower = more blur)
  laplacianScore: number;    // 0-1 (lower = more blur)
  overallScore: number;      // 0-1 (weighted average)
  status: BlurStatus;        // 'clear' | 'slightly-blurry' | 'very-blurry'
  isBlurry: boolean;         // Based on threshold
  processingTimeMs: number;  // Processing time
  timestamp: number;         // When analyzed
}
```

### Native Module Methods

**detectBlur(frame)**: Synchronous blur detection for frame processor
**analyzeBlur(imageBuffer, width, height)**: Async blur analysis for image buffers

## Performance

### Benchmarks

- **Target FPS**: 30 FPS on mid-range devices
- **Processing Time**: 10-30ms per frame (640x480)
- **Memory Usage**: < 50MB typical usage

### Optimization Tips

1. **Adjust frame skip rate**: Set `frameSkipRate: 2` or higher for better performance
2. **Lower resolution**: Images are automatically resized to 640x480 for processing
3. **Disable unused features**: Adjust algorithm weights to 0 for algorithms you don't need
4. **Reduce sensitivity**: Lower sensitivity settings process faster

## Troubleshooting

### iOS Issues

**Module not found**: Run `pod install` in the ios directory

**Build errors**: Clean build folder in Xcode (Cmd+Shift+K) and rebuild

### Android Issues

**Gradle sync failed**: Update Android Studio and sync Gradle files

**Native module not available**: Check that Kotlin version is compatible (1.9.0+)

### Common Issues

**Permission denied**: Ensure camera permissions are granted in device settings

**Low FPS**: Increase `frameSkipRate` or reduce camera resolution

**Inaccurate scores**: Calibrate `threshold` based on your use case

## Project Structure

```
xylorix-blur-detector/
├── src/
│   ├── components/          # React components
│   │   ├── CameraScreen.tsx
│   │   ├── BlurIndicator.tsx
│   │   ├── MetricsDisplay.tsx
│   │   └── PermissionHandler.tsx
│   ├── screens/
│   │   └── BlurDetectorScreen.tsx
│   ├── types/               # TypeScript definitions
│   │   ├── blur.ts
│   │   └── native.ts
│   ├── utils/               # Utility functions
│   │   ├── blurDetection.ts
│   │   ├── constants.ts
│   │   └── logger.ts
│   ├── native/              # Native implementations
│   │   ├── ios/             # Swift/Objective-C
│   │   └── android/         # Kotlin
│   ├── NativeModules.ts
│   └── App.tsx
├── ios/                     # iOS project
├── android/                 # Android project
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Built by the Xylorix team using:
- [React Native](https://reactnative.dev/)
- [React Native Vision Camera](https://github.com/mrousavy/react-native-vision-camera)
- [Accelerate Framework](https://developer.apple.com/documentation/accelerate) (iOS)

## Support

For issues, questions, or contributions, please visit:
https://github.com/xinjietang/xylorix-blur-detector

---

Made with ❤️ by Xylorix
