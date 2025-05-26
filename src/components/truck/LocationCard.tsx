import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationCardProps {
  location?: string;
  onUpdateLocation?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onUpdateLocation }) => {
  return (
    <View style={styles.card}>
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={24} color="#F28C28" />
        <Text style={styles.locationText}>{location || 'Current Location'}</Text>
      </View>
      {onUpdateLocation && (
        <TouchableOpacity style={styles.updateButton} onPress={onUpdateLocation}>
          <Text style={styles.updateButtonText}>Update Location</Text>
        </TouchableOpacity>
      )}
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#F28C28',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});