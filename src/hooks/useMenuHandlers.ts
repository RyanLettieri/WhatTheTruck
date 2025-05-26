import { Alert } from 'react-native';
import { 
  createMenu, 
  createMenuItem, 
  updateMenuItem,
  updateMenu,
  deleteMenu,
  deleteMenuItem 
} from '../api/appwrite';
import { isValidImageUrl } from '../utils/validation';

export const useMenuHandlers = (
  truckData: any,
  menusData: any[],
  setMenusData: (menus: any[]) => void,
  modals: any
) => {
  const handleCreateMenu = async () => {
    if (!truckData || !modals.newMenuName.trim()) {
      Alert.alert('Error', 'Menu name is required.');
      return;
    }

    if (modals.newMenuImageUrl && !isValidImageUrl(modals.newMenuImageUrl)) {
      Alert.alert(
        'Invalid Image URL', 
        'Please enter a valid URL starting with http:// or https://'
      );
      return;
    }

    try {
      const menu = await createMenu(
        truckData.id, 
        modals.newMenuName.trim(), 
        modals.newMenuImageUrl.trim() || undefined
      );
      
      if (menu) {
        setMenusData([...menusData, { ...menu, items: [] }]);
        modals.resetCreateMenuModal();
        Alert.alert('Success', 'Menu created successfully');
      } else {
        Alert.alert('Error', 'Failed to create menu');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the menu.');
    }
  };

  const openEditMenuModal = (menu: any) => {
    modals.setEditingMenu(menu);
    modals.setEditMenuName(menu.name);
    modals.setEditMenuImageUrl(menu.image_url || '');
    modals.setMenuEditModalVisible(true);
  };

  const handleUpdateMenu = async () => {
    if (!modals.editingMenu || !modals.editMenuName.trim()) {
      Alert.alert('Error', 'Menu name cannot be empty.');
      return;
    }

    if (modals.editMenuImageUrl && !isValidImageUrl(modals.editMenuImageUrl)) {
      Alert.alert(
        'Invalid Image URL', 
        'Please enter a valid URL starting with http:// or https://'
      );
      return;
    }

    try {
      const updatedMenu = await updateMenu(modals.editingMenu.id, {
        name: modals.editMenuName.trim(),
        image_url: modals.editMenuImageUrl.trim() || undefined,
      });

      if (updatedMenu) {
        setMenusData(prevMenusData =>
          prevMenusData.map(menu =>
            menu.id === modals.editingMenu.id 
              ? { ...menu, name: updatedMenu.name, image_url: updatedMenu.image_url }
              : menu
          )
        );
        modals.resetMenuModal();
        Alert.alert('Success', 'Menu updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update menu.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the menu.');
    }
  };

  const openAddItemModal = (menuId: string) => {
    modals.setActiveMenuId(menuId);
    modals.setEditingMenuItem(null);
    modals.setNewItemName('');
    modals.setNewItemPrice('');
    modals.setNewItemDescription('');
    modals.setMenuItemModalVisible(true);
  };

  const openEditItemModal = (item: any, menuId: string) => {
    modals.setActiveMenuId(menuId);
    modals.setEditingMenuItem(item);
    modals.setNewItemName(item.name);
    modals.setNewItemPrice(item.price.toString());
    modals.setNewItemDescription(item.description || '');
    modals.setMenuItemModalVisible(true);
  };

  const handleSaveMenuItem = async () => {
    if (!modals.newItemName || !modals.newItemPrice) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    if (!modals.activeMenuId && !modals.editingMenuItem) {
      Alert.alert('Error', 'No menu selected');
      return;
    }

    try {
      if (modals.editingMenuItem) {
        // Update existing item
        const updatedItem = await updateMenuItem(modals.editingMenuItem.id, {
          name: modals.newItemName,
          price: parseFloat(modals.newItemPrice),
          description: modals.newItemDescription,
        });

        if (updatedItem) {
          setMenusData(prevMenusData =>
            prevMenusData.map(menu =>
              menu.items.some((item: any) => item.id === modals.editingMenuItem.id)
                ? { 
                    ...menu, 
                    items: menu.items.map((item: any) => 
                      item.id === updatedItem.id ? updatedItem : item
                    ) 
                  }
                : menu
            )
          );
          Alert.alert('Success', 'Menu item updated');
        }
      } else if (modals.activeMenuId) {
        // Add new item
        const menuItem = await createMenuItem(
          modals.activeMenuId,
          modals.newItemName,
          parseFloat(modals.newItemPrice),
          modals.newItemDescription
        );

        if (menuItem) {
          setMenusData(prevMenusData =>
            prevMenusData.map(menu =>
              menu.id === modals.activeMenuId
                ? { ...menu, items: [...menu.items, menuItem] }
                : menu
            )
          );
          Alert.alert('Success', 'Menu item added');
        }
      }

      modals.resetMenuItemModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to save menu item');
    }
  };

  const handleDeleteMenu = async (menu: any) => {
    try {
      const success = await deleteMenu(menu.id);
      
      if (success) {
        setMenusData(menusData.filter(m => m.id !== menu.id));
        Alert.alert('Success', 'Menu deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      Alert.alert('Error', 'An error occurred while deleting the menu');
    }
  };

  const handleDeleteMenuItem = async (item: any, menuId: string) => {
    try {
      const success = await deleteMenuItem(item.id);
      
      if (success) {
        setMenusData(prevMenusData =>
          prevMenusData.map(menu =>
            menu.id === menuId
              ? { ...menu, items: menu.items.filter((i: any) => i.id !== item.id) }
              : menu
          )
        );
        Alert.alert('Success', 'Item deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'An error occurred while deleting the item');
    }
  };

  return {
    handleCreateMenu,
    openEditMenuModal,
    handleUpdateMenu,
    openAddItemModal,
    openEditItemModal,
    handleSaveMenuItem,
    handleDeleteMenu,
    handleDeleteMenuItem,
  };
};