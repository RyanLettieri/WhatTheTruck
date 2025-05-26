import { useState } from 'react';

export const useModals = () => {
  // Menu Item Modal state
  const [menuItemModalVisible, setMenuItemModalVisible] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  
  // Menu Edit Modal state
  const [menuEditModalVisible, setMenuEditModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [editMenuName, setEditMenuName] = useState('');
  const [editMenuImageUrl, setEditMenuImageUrl] = useState('');
  
  // Create Menu Modal state
  const [createMenuModalVisible, setCreateMenuModalVisible] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuImageUrl, setNewMenuImageUrl] = useState('');
  
  // Track which menu we're adding items to
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const resetMenuItemModal = () => {
    setMenuItemModalVisible(false);
    setActiveMenuId(null);
    setEditingMenuItem(null);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('');
  };

  const resetMenuModal = () => {
    setMenuEditModalVisible(false);
    setEditingMenu(null);
    setEditMenuName('');
    setEditMenuImageUrl('');
  };

  const resetCreateMenuModal = () => {
    setCreateMenuModalVisible(false);
    setNewMenuName('');
    setNewMenuImageUrl('');
  };

  return {
    // Menu Item Modal
    menuItemModalVisible,
    setMenuItemModalVisible,
    editingMenuItem,
    setEditingMenuItem,
    newItemName,
    setNewItemName,
    newItemPrice,
    setNewItemPrice,
    newItemDescription,
    setNewItemDescription,
    activeMenuId,
    setActiveMenuId,
    resetMenuItemModal,

    // Menu Edit Modal
    menuEditModalVisible,
    setMenuEditModalVisible,
    editingMenu,
    setEditingMenu,
    editMenuName,
    setEditMenuName,
    editMenuImageUrl,
    setEditMenuImageUrl,
    resetMenuModal,

    // Create Menu Modal
    createMenuModalVisible,
    setCreateMenuModalVisible,
    newMenuName,
    setNewMenuName,
    newMenuImageUrl,
    setNewMenuImageUrl,
    resetCreateMenuModal,
  };
};