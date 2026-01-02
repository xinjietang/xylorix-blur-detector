# Quick Start Guide

Get up and running with Xylorix Blur Detector in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK 17

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/xinjietang/xylorix-blur-detector.git
cd xylorix-blur-detector

# Install dependencies
npm install
```

## Step 2: iOS Setup

```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..

# Run on iOS
npm run ios
```

**Troubleshooting iOS**:
- If pod install fails: `pod repo update` then try again
- If build fails: Clean build folder in Xcode (Cmd+Shift+K)

## Step 3: Android Setup

```bash
# No additional setup needed - Gradle handles it

# Run on Android
npm run android
```

**Troubleshooting Android**:
- Make sure Android SDK is installed
- Set ANDROID_HOME environment variable
- Accept SDK licenses: `sdkmanager --licenses`

## Step 4: Grant Permissions

When you first run the app:
1. Tap "Grant Permission" button
2. Select "Allow" for camera access
3. The camera preview should appear

## Step 5: Test Blur Detection

1. Point the camera at a sharp, well-lit subject
2. Watch the blur indicator turn **green** (clear)
3. Move the camera quickly or point at out-of-focus objects
4. Watch the indicator turn **yellow** (slightly blurry) or **red** (very blurry)

## What You See

### Main Interface

- **Camera Preview**: Live camera feed
- **Blur Indicator**: Circular indicator showing blur status
  - 🟢 Green = Clear image (score > 50%)
  - 🟡 Yellow = Slightly blurry (score 30-50%)
  - 🔴 Red = Very blurry (score < 30%)
- **Metrics Panel**: Detailed scores and performance stats
- **Sensitivity Controls**: Adjust detection sensitivity

### Metrics Displayed

- **FFT Score**: Frequency domain analysis (0-100%)
- **Sobel Score**: Edge detection analysis (0-100%)
- **Laplacian Score**: Variance-based analysis (0-100%)
- **Overall Score**: Combined score from all algorithms
- **FPS**: Frames processed per second
- **Processing Time**: Time to analyze each frame (milliseconds)

## Quick Customization

### Change Sensitivity

Tap the sensitivity buttons at the bottom:
- **Low**: More lenient (only flags heavy blur)
- **Medium**: Balanced (default)
- **High**: Strict (flags slight blur)

### Modify Configuration

Edit `src/screens/BlurDetectorScreen.tsx`:

```typescript
const [config, setConfig] = useState<BlurDetectionConfig>({
  threshold: 0.4,        // Adjust this (0.0-1.0)
  sensitivity: 'medium', // 'low' | 'medium' | 'high'
  frameSkipRate: 1,      // Process every frame
  algorithmWeights: {
    fft: 0.33,
    sobel: 0.34,
    laplacian: 0.33,
  },
});
```

## Common Adjustments

### Better Performance (Lower-End Devices)

```typescript
frameSkipRate: 3,  // Process every 3rd frame
```

### More Strict Blur Detection

```typescript
sensitivity: 'high',  // Or threshold: 0.5
```

### Focus on Specific Algorithm

```typescript
algorithmWeights: {
  fft: 0.6,        // Emphasize FFT
  sobel: 0.2,
  laplacian: 0.2,
}
```

## Next Steps

- 📖 Read the [full documentation](README.md)
- 🛠 Check the [setup guide](SETUP.md) for detailed instructions
- 📚 Review [usage examples](EXAMPLES.md) for integration patterns
- 🔧 Explore the [API reference](API.md) for all options

## Need Help?

- Check [TROUBLESHOOTING](#troubleshooting) section in SETUP.md
- Open an issue on GitHub
- Review the code comments in source files

## Tips for Best Results

1. **Good Lighting**: Blur detection works best in well-lit conditions
2. **Stable Camera**: Hold device steady for accurate readings
3. **Varied Scenes**: Test with different subjects and distances
4. **Device Performance**: Monitor FPS to ensure smooth operation
5. **Calibration**: Adjust threshold based on your specific use case

---

**Congratulations!** 🎉 You now have Xylorix Blur Detector running!

Experiment with different scenes, adjust settings, and explore the code to understand how it works.
