import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const StatusCard = ({ trucks, onUpdateLocation, onToggleAvailability }) => {
  const mainTruck = trucks && trucks.length > 0 ? trucks[0] : null;
  const isOperating = mainTruck?.available || false;
  const hasLocation = mainTruck?.location?.address || false;
  
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Status</Text>
      
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Ionicons name="location-outline" size={18} color="#32CD32" />
          <Text style={styles.statusLabel}>Location Status</Text>
        </View>
        <TouchableOpacity onPress={onUpdateLocation}>
          <Text style={styles.statusValue}>{hasLocation ? 'Set' : 'Not Set'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Ionicons name="restaurant-outline" size={18} color="#32CD32" />
          <Text style={styles.statusLabel}>Taking Orders</Text>
        </View>
        <Switch
          value={isOperating}
          onValueChange={onToggleAvailability}
          trackColor={{ false: '#E0E0E0', true: '#4CD964' }}
          thumbColor={'#FFFFFF'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    color: '#32CD32',
    fontWeight: '500',
  },
});