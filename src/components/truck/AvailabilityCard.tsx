import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface AvailabilityCardProps {
  available: boolean;
  onToggleAvailable: (value: boolean) => void;
  updating: boolean;
}

export const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  available,
  onToggleAvailable,
  updating,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.availabilityHeader}>
        <Text style={styles.availabilityTitle}>Availability</Text>
        <Switch
          value={!!available}
          onValueChange={onToggleAvailable}
          disabled={updating}
          trackColor={{ false: '#e0e0e0', true: '#b8e0d2' }}
          thumbColor={available ? '#4CAF50' : '#f4f3f4'}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>42</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>$560.75</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Cheeseburger</Text>
          <Text style={styles.statLabel}>Most Popular</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});