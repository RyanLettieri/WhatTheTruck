import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
  };
  onPress: () => void;
  onDelete: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, onPress, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: onDelete 
        }
      ]
    );
  };

  return (
    <View style={styles.menuItem}>
      <TouchableOpacity style={styles.menuItemContent} onPress={onPress}>
        <View style={styles.menuItemMain}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription}>
            {item.description || "Food Item"}
          </Text>
        </View>
        <View style={styles.menuItemSide}>
          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.menuItemActions}>
        <TouchableOpacity onPress={onPress} style={styles.actionButton}>
          <Ionicons name="pencil" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={16} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItemMain: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuItemSide: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  menuItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});