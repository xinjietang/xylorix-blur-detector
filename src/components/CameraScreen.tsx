/**
 * Camera Screen Component
 * Main component integrating Vision Camera with blur detection
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { BlurMetrics, BlurDetectionConfig } from '../types/blur';
import { createBlurMetrics, calculateFPS } from '../utils/blurDetection';
import { logger } from '../utils/logger';
import BlurDetectorModule from '../NativeModules';

export interface CameraScreenProps {
  config: BlurDetectionConfig;
  onBlurMetricsUpdate: (metrics: BlurMetrics) => void;
  onFPSUpdate: (fps: number) => void;
}

/**
 * Camera screen with live blur detection
 */
export const CameraScreen: React.FC<CameraScreenProps> = ({
  config,
  onBlurMetricsUpdate,
  onFPSUpdate,
}) => {
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(true);
  const frameCount = useRef(0);
  const timestamps = useRef<number[]>([]);

  /**
   * Frame processor for blur detection
   * Runs on every camera frame using Vision Camera worklets
   */
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      frameCount.current++;
      
      // Apply frame skip rate
      if (frameCount.current % config.frameSkipRate !== 0) {
        return;
      }
      
      // Call native blur detector
      if (BlurDetectorModule && BlurDetectorModule.detectBlur) {
        const nativeResult = BlurDetectorModule.detectBlur(frame);
        
        if (nativeResult) {
          // Update timestamps for FPS calculation
          const now = Date.now();
          timestamps.current.push(now);
          
          // Keep only last 30 timestamps
          if (timestamps.current.length > 30) {
            timestamps.current.shift();
          }
          
          // Convert native result to full metrics
          const metrics = createBlurMetrics(nativeResult, config);
          
          // Update parent component
          onBlurMetricsUpdate(metrics);
          
          // Calculate and update FPS
          if (timestamps.current.length >= 2) {
            const fps = calculateFPS(timestamps.current);
            onFPSUpdate(fps);
          }
          
          // Log metrics if debug enabled
          logger.logBlurMetrics(metrics);
        }
      }
    } catch (error) {
      logger.error('Frame processor error:', error);
    }
  }, [config, onBlurMetricsUpdate, onFPSUpdate]);

  useEffect(() => {
    setIsActive(true);
    return () => {
      setIsActive(false);
    };
  }, []);

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});
