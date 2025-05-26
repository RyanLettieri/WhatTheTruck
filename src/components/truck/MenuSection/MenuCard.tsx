import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from './MenuItem';

interface MenuCardProps {
  menu: any;
  expanded: boolean;
  onToggleExpansion: () => void;
  onEdit: () => void;
  onDelete: () => void; // Add this
  onAddItem: () => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void; // Add this
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  expanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const getPublicImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('&mode=admin')) {
      return url.replace('&mode=admin', '');
    }
    return url;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Menu',
      `Are you sure you want to delete "${menu.name}"? This will also delete all items in this menu.`,
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
    <View style={styles.card}>
      <TouchableOpacity style={styles.menuHeader} onPress={onToggleExpansion}>
        <Text style={styles.menuTitle}>{menu.name}</Text>
        <View style={styles.menuActions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <Ionicons name="pencil" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={18} color="#dc3545" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddItem} style={styles.iconButton}>
            <Ionicons name="add" size={22} color="#F28C28" />
          </TouchableOpacity>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>

      {menu.image_url && (
        <View style={styles.menuImageContainer}>
          <Image 
            source={{ uri: getPublicImageUrl(menu.image_url) }} 
            style={styles.menuImage}
            resizeMode="cover"
            onError={(e) => {
              console.error(`Failed to load image for menu "${menu.name}":`, menu.image_url);
            }}
          />
        </View>
      )}

      {expanded && (
        <>
          {menu.items && menu.items.length > 0 ? (
            menu.items.map((item: any) => (
              <MenuItem
                key={item.id}
                item={item}
                onPress={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No items in this menu yet.</Text>
          )}
        </>
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
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  menuActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 12,
    padding: 4,
  },
  menuImageContainer: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuImage: {
    width: '100%',
    height: 140,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
});