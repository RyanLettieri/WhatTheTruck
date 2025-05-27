import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatusLabel } from './OrderStatusLabel';

interface OrderStatsSummaryProps {
  stats: {
    new: number;
    preparing: number;
    ready: number;
    completed: number;
  };
}

export const OrderStatsSummary = ({ stats }: OrderStatsSummaryProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders Dashboard</Text>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <OrderStatusLabel status="new" compact />
          <Text style={styles.statCount}>{stats.new}</Text>
        </View>
        
        <View style={styles.statItem}>
          <OrderStatusLabel status="preparing" compact />
          <Text style={styles.statCount}>{stats.preparing}</Text>
        </View>
        
        <View style={styles.statItem}>
          <OrderStatusLabel status="ready" compact />
          <Text style={styles.statCount}>{stats.ready}</Text>
        </View>
        
        <View style={styles.statItem}>
          <OrderStatusLabel status="completed" compact />
          <Text style={styles.statCount}>{stats.completed}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
});