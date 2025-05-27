import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const QuickActions = ({ onUpdateLocation, onViewEarnings }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.locationButton]} onPress={onUpdateLocation}>
          <Ionicons name="location-outline" size={20} color="#FF7A45" />
          <Text style={styles.locationButtonText}>Update Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.earningsButton]} onPress={onViewEarnings}>
          <Ionicons name="cash-outline" size={20} color="#2CB36B" />
          <Text style={styles.earningsButtonText}>View Earnings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  locationButton: {
    backgroundColor: '#FFF3F0',
  },
  locationButtonText: {
    color: '#FF7A45',
    marginLeft: 8,
    fontWeight: '500',
  },
  earningsButton: {
    backgroundColor: '#EEFAF3',
  },
  earningsButtonText: {
    color: '#2CB36B',
    marginLeft: 8,
    fontWeight: '500',
  },
});