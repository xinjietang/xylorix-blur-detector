/**
 * Metrics Display Component
 * Shows detailed blur detection metrics and performance stats
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurMetrics } from '../types/blur';

export interface MetricsDisplayProps {
  metrics: BlurMetrics | null;
  fps: number;
}

/**
 * Component that displays all blur detection metrics
 */
export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, fps }) => {
  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No metrics available</Text>
      </View>
    );
  }

  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Algorithm Scores</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>FFT (Frequency Analysis):</Text>
          <Text style={styles.metricValue}>{formatScore(metrics.fftScore)}</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Sobel (Edge Detection):</Text>
          <Text style={styles.metricValue}>{formatScore(metrics.sobelScore)}</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Laplacian (Variance):</Text>
          <Text style={styles.metricValue}>{formatScore(metrics.laplacianScore)}</Text>
        </View>
        
        <View style={[styles.metricRow, styles.overallRow]}>
          <Text style={styles.overallLabel}>Overall Score:</Text>
          <Text style={styles.overallValue}>{formatScore(metrics.overallScore)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>FPS:</Text>
          <Text style={styles.metricValue}>{fps.toFixed(1)}</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Processing Time:</Text>
          <Text style={styles.metricValue}>{metrics.processingTimeMs.toFixed(2)} ms</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Status:</Text>
          <Text style={[styles.metricValue, styles.statusText]}>{metrics.status.toUpperCase()}</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Is Blurry:</Text>
          <Text style={styles.metricValue}>{metrics.isBlurry ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  overallRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    borderBottomWidth: 0,
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  overallValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusText: {
    textTransform: 'uppercase',
  },
});
