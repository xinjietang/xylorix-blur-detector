/**
 * Blur Indicator Component
 * Visual indicator showing the current blur status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurStatus } from '../types/blur';
import { BLUR_INDICATOR_COLORS } from '../utils/constants';

export interface BlurIndicatorProps {
  status: BlurStatus;
  overallScore: number;
  isBlurry: boolean;
}

/**
 * Component that displays the current blur status with visual feedback
 */
export const BlurIndicator: React.FC<BlurIndicatorProps> = ({
  status,
  overallScore,
  isBlurry,
}) => {
  // Determine color based on status
  const getStatusColor = (): string => {
    switch (status) {
      case 'clear':
        return BLUR_INDICATOR_COLORS.clear;
      case 'slightly-blurry':
        return BLUR_INDICATOR_COLORS.slightlyBlurry;
      case 'very-blurry':
        return BLUR_INDICATOR_COLORS.veryBlurry;
      default:
        return '#999';
    }
  };

  // Get status text
  const getStatusText = (): string => {
    switch (status) {
      case 'clear':
        return 'CLEAR';
      case 'slightly-blurry':
        return 'SLIGHTLY BLURRY';
      case 'very-blurry':
        return 'VERY BLURRY';
      default:
        return 'UNKNOWN';
    }
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const scorePercent = Math.round(overallScore * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.scoreText}>{scorePercent}%</Text>
      </View>
      <Text style={styles.label}>
        {isBlurry ? '⚠️ Image is Blurry' : '✓ Image is Sharp'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  indicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  scoreText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
