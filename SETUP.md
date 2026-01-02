# Setup Guide - Xylorix Blur Detector

This guide provides detailed setup instructions for developing and running the Xylorix Blur Detector application on iOS and Android.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [iOS Development Setup](#ios-development-setup)
- [Android Development Setup](#android-development-setup)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## Prerequisites

### General Requirements

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be >= 18
   ```

2. **npm** or **yarn**
   ```bash
   npm --version
   ```

3. **Git**
   ```bash
   git --version
   ```

### iOS Development (macOS only)

1. **macOS** (Ventura 13 or higher recommended)

2. **Xcode** (14.0 or higher)
   - Download from Mac App Store
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

3. **CocoaPods** (1.11 or higher)
   ```bash
   sudo gem install cocoapods
   pod --version
   ```

4. **iOS Simulator** or physical iOS device (iOS 13+)

### Android Development

1. **Android Studio** (Flamingo or higher)
   - Download from https://developer.android.com/studio

2. **Java Development Kit (JDK)** 17
   ```bash
   java -version  # Should be 17
   ```

3. **Android SDK**
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools

4. **Environment Variables**
   Add to your `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/xinjietang/xylorix-blur-detector.git
cd xylorix-blur-detector
```

### 2. Install Node Dependencies

```bash
npm install
```

This will install all JavaScript dependencies including:
- React Native 0.73
- React Native Vision Camera v3
- TypeScript
- Other development dependencies

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` to customize settings (optional):
```
LOG_LEVEL=info
BLUR_THRESHOLD=0.4
FRAME_SKIP_RATE=1
PERFORMANCE_MODE=medium
```

## iOS Development Setup

### 1. Install CocoaPods Dependencies

```bash
cd ios
pod install
cd ..
```

This installs:
- React Native iOS dependencies
- Vision Camera iOS framework
- Native Swift dependencies

### 2. Open iOS Project in Xcode

```bash
open ios/xylorixBlurDetector.xcworkspace
```

**Important**: Always open the `.xcworkspace` file, NOT the `.xcodeproj` file.

### 3. Configure Signing & Capabilities

In Xcode:
1. Select the project in the navigator
2. Select the "xylorixBlurDetector" target
3. Go to "Signing & Capabilities" tab
4. Select your development team
5. Xcode will automatically manage provisioning profiles

### 4. Add Camera Usage Description

The `Info.plist` should already contain camera permissions, but verify:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to detect blur in real-time</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for video recording</string>
```

### 5. Build and Run on iOS

**Using React Native CLI**:
```bash
npm run ios
```

**Using Xcode**:
1. Select a simulator or connected device
2. Click the "Play" button (Cmd+R)

**Specific simulator**:
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

### 6. Verify Native Module Linking

If the app shows "Module Not Available" error:
1. Clean build folder: Xcode → Product → Clean Build Folder (Cmd+Shift+K)
2. Delete `ios/Pods` and `ios/Podfile.lock`
3. Run `pod install` again
4. Rebuild the app

## Android Development Setup

### 1. Open Android Studio

```bash
# Open the android folder in Android Studio
studio android/
```

Or use File → Open and select the `android` folder.

### 2. Sync Gradle

Android Studio should automatically sync Gradle. If not:
- Click "Sync Project with Gradle Files" in the toolbar
- Or: File → Sync Project with Gradle Files

### 3. Create/Update local.properties

Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

Replace `YOUR_USERNAME` with your actual username.

### 4. Add Permissions to AndroidManifest.xml

Verify the following permissions are in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" />
```

### 5. Configure Build Variants

In Android Studio:
1. Go to Build → Select Build Variant
2. Choose "debug" for development

### 6. Build and Run on Android

**Using React Native CLI**:
```bash
npm run android
```

**Using Android Studio**:
1. Select a device/emulator from the dropdown
2. Click the "Run" button (Ctrl+R)

**Specific emulator**:
```bash
npm run android -- --deviceId=emulator-5554
```

### 7. Enable Developer Options on Physical Device

If using a physical Android device:
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times to enable Developer Options
3. Go to Settings → Developer Options
4. Enable "USB Debugging"
5. Connect device via USB
6. Accept the USB debugging prompt on device

### 8. Verify Native Module Linking

If module is not available:
1. Clean Gradle cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
2. Rebuild:
   ```bash
   npm run android
   ```

## Troubleshooting

### General Issues

**Metro bundler port conflict**:
```bash
npx react-native start --reset-cache --port 8082
```

**Node modules issues**:
```bash
rm -rf node_modules
npm install
```

**Clear all caches**:
```bash
npm start -- --reset-cache
```

### iOS Issues

**Pod install fails**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..
```

**Xcode build fails**:
1. Clean build: Cmd+Shift+K
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Quit Xcode and rebuild

**Module not found errors**:
- Make sure you opened `.xcworkspace`, not `.xcodeproj`
- Verify native files are included in Xcode project
- Check Build Phases → Compile Sources

### Android Issues

**Gradle sync fails**:
```bash
cd android
./gradlew clean
./gradlew --stop
cd ..
rm -rf android/.gradle
npm run android
```

**ADB not found**:
```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
adb devices
```

**Native module not found**:
- Check `android/settings.gradle` includes the app module
- Verify `BlurDetectorPackage` is registered in `MainApplication.kt/java`
- Clean and rebuild

**Emulator issues**:
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_34
```

### Camera Permission Issues

**iOS**: If camera permission is denied after granting:
1. Reset simulator: Device → Erase All Content and Settings
2. On device: Settings → Privacy → Camera → Toggle app permission

**Android**: If camera permission is denied:
1. Settings → Apps → Xylorix Blur Detector → Permissions → Camera → Allow
2. Or uninstall and reinstall the app

### Performance Issues

**Low FPS on device**:
- Increase `frameSkipRate` in config
- Reduce camera resolution
- Enable Release build mode

**High memory usage**:
- Check for memory leaks in frame processor
- Verify images are properly released after processing
- Use Xcode Instruments or Android Profiler

## Development Workflow

### 1. Start Metro Bundler

```bash
npm start
```

Keep this running in a separate terminal.

### 2. Enable Fast Refresh

Fast Refresh is enabled by default. Shake device and select "Enable Fast Refresh" if disabled.

### 3. Debugging

**React Native Debugger**:
- Shake device → "Debug" (deprecated in newer versions)
- Use Flipper for advanced debugging

**Logs**:
```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

**Chrome DevTools**:
- Press 'j' in Metro terminal to open debugger

### 4. Testing Changes

**Hot reload**: Cmd+R (iOS) or Double-tap R (Android)

**Full rebuild**:
```bash
# iOS
npm run ios

# Android
npm run android
```

### 5. Production Build

**iOS**:
1. Change scheme to Release in Xcode
2. Archive: Product → Archive
3. Export IPA for distribution

**Android**:
```bash
cd android
./gradlew assembleRelease
```

APK will be in `android/app/build/outputs/apk/release/`

## Best Practices

1. **Always use .xcworkspace** on iOS
2. **Clean build** when native code changes
3. **Reset cache** when experiencing unexplained issues
4. **Update dependencies** carefully - test after each update
5. **Commit Podfile.lock and gradle.properties** to version control
6. **Test on real devices** for accurate performance metrics

## Next Steps

After successful setup:
1. Run the app and verify camera permissions work
2. Point camera at various scenes to test blur detection
3. Adjust sensitivity settings to calibrate for your use case
4. Review code in `src/` to understand the implementation
5. Customize UI components in `src/components/`
6. Modify native algorithms in `src/native/ios/` or `src/native/android/`

## Support

For additional help:
- Check the main README.md
- Review code comments in source files
- Open an issue on GitHub: https://github.com/xinjietang/xylorix-blur-detector/issues

---

Happy coding! 🚀
