import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TruckItem = ({ truck, onUpdateAvailability, onViewSales, onManage }) => {
  return (
    <View style={styles.truckItem}>
      <View style={styles.truckHeader}>
        <View style={styles.truckInfo}>
          <Ionicons name="fast-food-outline" size={20} color="#333" />
          <View style={styles.truckNameContainer}>
            <Text style={styles.truckName}>{truck.truck_name}</Text>
            <Text style={styles.truckLocation}>
              Active • {truck.location?.address || 'No location set'}
            </Text>
          </View>
        </View>
        <View style={styles.truckStatus}>
          <Text style={[styles.statusText, { color: truck.available ? '#32CD32' : '#888' }]}>
            {truck.available ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>
      
      <View style={styles.truckActions}>
        <TouchableOpacity 
          style={[styles.actionButton, truck.available ? styles.activeActionButton : {}]}
          onPress={() => onUpdateAvailability(truck, !truck.available)}
        >
          <Text style={[
            styles.actionButtonText,
            truck.available ? styles.activeActionButtonText : {}
          ]}>
            {truck.available ? 'Set Closed' : 'Set Open'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onViewSales(truck)}
        >
          <Text style={styles.actionButtonText}>View Sales</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onManage(truck)}
        >
          <Text style={styles.actionButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const TrucksList = ({ trucks, onAddTruck, onUpdateAvailability, onViewSales, onManage }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trucks</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddTruck}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add Truck</Text>
        </TouchableOpacity>
      </View>
      
      {trucks.length > 0 ? (
        trucks.map(truck => (
          <TruckItem 
            key={truck.$id || truck.id}
            truck={truck}
            onUpdateAvailability={onUpdateAvailability}
            onViewSales={onViewSales}
            onManage={onManage}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No trucks added yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  truckItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  truckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckNameContainer: {
    marginLeft: 8,
  },
  truckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  truckLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  truckStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  truckActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  activeActionButton: {
    backgroundColor: '#2CB36B20', // Light green background
  },
  activeActionButtonText: {
    color: '#2CB36B', // Green text
  }
});