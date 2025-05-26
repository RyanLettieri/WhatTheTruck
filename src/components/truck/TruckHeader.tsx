import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TruckHeaderProps {
  truckName: string;
  onProfilePress: () => void;
}

export const TruckHeader: React.FC<TruckHeaderProps> = ({ truckName, onProfilePress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{truckName}</Text>
      <TouchableOpacity onPress={onProfilePress}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F28C28',
    alignItems: 'center',
    justifyContent: 'center',
  },
});