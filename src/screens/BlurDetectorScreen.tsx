/**
 * Blur Detector Screen
 * Main demo screen showing real-time blur detection
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { CameraScreen } from '../components/CameraScreen';
import { BlurIndicator } from '../components/BlurIndicator';
import { MetricsDisplay } from '../components/MetricsDisplay';
import { PermissionHandler } from '../components/PermissionHandler';
import { BlurMetrics, BlurDetectionConfig } from '../types/blur';
import { mergeBlurConfig } from '../utils/blurDetection';
import { DEFAULT_BLUR_CONFIG } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Main blur detector demo screen
 */
export const BlurDetectorScreen: React.FC = () => {
  const [config, setConfig] = useState<BlurDetectionConfig>(DEFAULT_BLUR_CONFIG);
  const [metrics, setMetrics] = useState<BlurMetrics | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  /**
   * Handle blur metrics updates from camera
   */
  const handleBlurMetricsUpdate = useCallback((newMetrics: BlurMetrics) => {
    setMetrics(newMetrics);
  }, []);

  /**
   * Handle FPS updates
   */
  const handleFPSUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  /**
   * Handle permission granted
   */
  const handlePermissionGranted = useCallback(() => {
    setPermissionGranted(true);
    logger.info('Camera permission granted');
  }, []);

  /**
   * Toggle metrics display
   */
  const toggleMetrics = useCallback(() => {
    setShowMetrics((prev) => !prev);
  }, []);

  /**
   * Change sensitivity
   */
  const changeSensitivity = useCallback((sensitivity: 'low' | 'medium' | 'high') => {
    const newConfig = mergeBlurConfig({ ...config, sensitivity });
    setConfig(newConfig);
    logger.info(`Sensitivity changed to ${sensitivity}`);
  }, [config]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <PermissionHandler onPermissionGranted={handlePermissionGranted}>
        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraScreen
            config={config}
            onBlurMetricsUpdate={handleBlurMetricsUpdate}
            onFPSUpdate={handleFPSUpdate}
          />
          
          {/* Overlay with blur indicator */}
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.title}>Xylorix Blur Detector</Text>
              <TouchableOpacity onPress={toggleMetrics} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>
                  {showMetrics ? 'Hide' : 'Show'} Metrics
                </Text>
              </TouchableOpacity>
            </View>

            {metrics && (
              <View style={styles.indicatorContainer}>
                <BlurIndicator
                  status={metrics.status}
                  overallScore={metrics.overallScore}
                  isBlurry={metrics.isBlurry}
                />
              </View>
            )}

            {/* Sensitivity Controls */}
            <View style={styles.controls}>
              <Text style={styles.controlLabel}>Sensitivity:</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.sensitivityButton,
                    config.sensitivity === 'low' && styles.activeButton,
                  ]}
                  onPress={() => changeSensitivity('low')}
                >
                  <Text style={styles.buttonText}>Low</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sensitivityButton,
                    config.sensitivity === 'medium' && styles.activeButton,
                  ]}
                  onPress={() => changeSensitivity('medium')}
                >
                  <Text style={styles.buttonText}>Med</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sensitivityButton,
                    config.sensitivity === 'high' && styles.activeButton,
                  ]}
                  onPress={() => changeSensitivity('high')}
                >
                  <Text style={styles.buttonText}>High</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Metrics Panel */}
        {showMetrics && (
          <View style={styles.metricsPanel}>
            <MetricsDisplay metrics={metrics} fps={fps} />
          </View>
        )}
      </PermissionHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  sensitivityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsPanel: {
    height: 280,
    backgroundColor: '#fff',
  },
});
