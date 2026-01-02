/**
 * Xylorix Blur Detector App
 * React Native Vision Camera blur detection demo
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BlurDetectorScreen } from './screens/BlurDetectorScreen';
import { isBlurDetectorAvailable, getPlatformInfo } from './NativeModules';
import { logger, LogLevel } from './utils/logger';

/**
 * Error boundary fallback component
 */
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>⚠️ Error</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <Text style={styles.errorHint}>
      Please check that the native modules are properly linked.
    </Text>
  </View>
);

/**
 * Main App Component
 */
const App: React.FC = () => {
  useEffect(() => {
    // Set log level (can be configured via environment)
    logger.setLogLevel(LogLevel.INFO);
    
    // Check if native module is available
    const platformInfo = getPlatformInfo();
    logger.info('Platform:', platformInfo.platform);
    
    if (!isBlurDetectorAvailable()) {
      logger.warn('BlurDetector native module is not available');
    } else {
      logger.info('BlurDetector native module is ready');
    }
  }, []);

  // Check if native module is available
  if (!isBlurDetectorAvailable()) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Module Not Available</Text>
        <Text style={styles.errorMessage}>
          BlurDetector native module is not available.
        </Text>
        <Text style={styles.errorHint}>
          Make sure you have run 'pod install' (iOS) or synced Gradle (Android).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurDetectorScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default App;
