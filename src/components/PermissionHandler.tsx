/**
 * Permission Handler Component
 * Manages camera permissions for React Native Vision Camera
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Platform, Linking } from 'react-native';
import { Camera } from 'react-native-vision-camera';

export interface PermissionHandlerProps {
  onPermissionGranted: () => void;
  children: React.ReactNode;
}

/**
 * Component that handles camera permission requests
 */
export const PermissionHandler: React.FC<PermissionHandlerProps> = ({
  onPermissionGranted,
  children,
}) => {
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'not-determined'>('not-determined');
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'not-determined'>('not-determined');

  /**
   * Check current permission status
   */
  const checkPermissions = useCallback(async () => {
    const cameraStatus = await Camera.getCameraPermissionStatus();
    const microphoneStatus = await Camera.getMicrophonePermissionStatus();
    
    setCameraPermission(cameraStatus);
    setMicrophonePermission(microphoneStatus);
    
    if (cameraStatus === 'granted') {
      onPermissionGranted();
    }
  }, [onPermissionGranted]);

  /**
   * Request camera and microphone permissions
   */
  const requestPermissions = useCallback(async () => {
    const cameraStatus = await Camera.requestCameraPermission();
    const microphoneStatus = await Camera.requestMicrophonePermission();
    
    setCameraPermission(cameraStatus);
    setMicrophonePermission(microphoneStatus);
    
    if (cameraStatus === 'granted') {
      onPermissionGranted();
    }
  }, [onPermissionGranted]);

  /**
   * Open app settings for manual permission grant
   */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // If permissions are granted, render children (camera)
  if (cameraPermission === 'granted') {
    return <>{children}</>;
  }

  // If permissions are denied, show instruction to open settings
  if (cameraPermission === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Denied</Text>
        <Text style={styles.message}>
          This app requires camera access to detect blur in real-time.
          Please enable camera permission in your device settings.
        </Text>
        <Button title="Open Settings" onPress={openSettings} />
      </View>
    );
  }

  // If permissions are not determined, show request button
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Permission Required</Text>
      <Text style={styles.message}>
        This app needs access to your camera to detect blur in real-time video frames.
      </Text>
      <Button title="Grant Permission" onPress={requestPermissions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    color: '#666',
  },
});
