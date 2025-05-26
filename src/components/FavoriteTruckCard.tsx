import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FavoriteTruckCardProps {
  truck: any;
  onPress: () => void;
  onRemoveFavorite: () => void;
}

export const FavoriteTruckCard: React.FC<FavoriteTruckCardProps> = ({
  truck,
  onPress,
  onRemoveFavorite,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚚</Text>
        </View>
        <Text style={styles.name}>{truck.truck_name}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, truck.available ? styles.available : styles.unavailable]} />
          <Text style={styles.statusText}>
            {truck.available ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton} onPress={onRemoveFavorite}>
        <Ionicons name="heart" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});