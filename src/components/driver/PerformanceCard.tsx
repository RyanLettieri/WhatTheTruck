import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PerformanceCard = ({ metrics, loading }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Performance</Text>
        <Ionicons name="stats-chart" size={20} color="#fff" />
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{metrics.totalOrders}</Text>
            <Text style={styles.metricLabel}>Orders</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricValue}>${metrics.totalRevenue.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricValue}>${metrics.averageOrder.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Avg Order</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2CB36B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'flex-start',
  },
  metricValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});