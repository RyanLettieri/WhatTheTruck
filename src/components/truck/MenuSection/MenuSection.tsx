import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuCard } from './MenuCard';

interface MenuSectionProps {
  menus: any[];
  expandedMenus: Record<string, boolean>;
  onToggleExpansion: (menuId: string) => void;
  onAddMenu: () => void;
  onEditMenu: (menu: any) => void;
  onDeleteMenu: (menu: any) => void; // Add this
  onAddMenuItem: (menuId: string) => void;
  onEditMenuItem: (item: any, menuId: string) => void;
  onDeleteMenuItem: (item: any, menuId: string) => void; // Add this
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menus,
  expandedMenus,
  onToggleExpansion,
  onAddMenu,
  onEditMenu,
  onDeleteMenu,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
}) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Menus</Text>
        <TouchableOpacity onPress={onAddMenu} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {menus.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>No menus yet. Click the '+' icon to add a menu.</Text>
        </View>
      ) : (
        menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            expanded={expandedMenus[menu.id] || false}
            onToggleExpansion={() => onToggleExpansion(menu.id)}
            onEdit={() => onEditMenu(menu)}
            onDelete={() => onDeleteMenu(menu)}
            onAddItem={() => onAddMenuItem(menu.id)}
            onEditItem={(item) => onEditMenuItem(item, menu.id)}
            onDeleteItem={(item) => onDeleteMenuItem(item, menu.id)}
          />
        ))
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#F28C28',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  emptyText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
});