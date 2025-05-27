import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface CategoryCardProps {
  name: string;
  icon: string;
  isSelected?: boolean;
  onPress: () => void;
}

export const CategoryCard = ({ name, icon, isSelected = false, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selected]} 
      onPress={onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selected: {
    backgroundColor: '#FFE8E0',
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  icon: {
    fontSize: 28,
    marginBottom: 5,
  },
  name: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  }
});