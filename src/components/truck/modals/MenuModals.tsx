import React from 'react';
import { CreateMenuModal } from './CreateMenuModal';
import { EditMenuModal } from './EditMenuModal';
import { MenuItemModal } from './MenuItemModal';

interface MenuModalsProps {
  // Menu Item Modal props
  menuItemModalVisible: boolean;
  setMenuItemModalVisible: (visible: boolean) => void;
  editingMenuItem: any;
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemPrice: string;
  setNewItemPrice: (price: string) => void;
  newItemDescription: string;
  setNewItemDescription: (desc: string) => void;
  resetMenuItemModal: () => void;

  // Menu Edit Modal props
  menuEditModalVisible: boolean;
  setMenuEditModalVisible: (visible: boolean) => void;
  editingMenu: any;
  editMenuName: string;
  setEditMenuName: (name: string) => void;
  editMenuImageUrl: string;
  setEditMenuImageUrl: (url: string) => void;
  resetMenuModal: () => void;

  // Create Menu Modal props
  createMenuModalVisible: boolean;
  setCreateMenuModalVisible: (visible: boolean) => void;
  newMenuName: string;
  setNewMenuName: (name: string) => void;
  newMenuImageUrl: string;
  setNewMenuImageUrl: (url: string) => void;
  resetCreateMenuModal: () => void;

  // Handlers
  onSaveMenuItem: () => void;
  onCreateMenu: () => void;
  onUpdateMenu: () => void;
}

export const MenuModals: React.FC<MenuModalsProps> = (props) => {
  return (
    <>
      <MenuItemModal
        visible={props.menuItemModalVisible}
        onClose={props.resetMenuItemModal}
        editingItem={props.editingMenuItem}
        itemName={props.newItemName}
        setItemName={props.setNewItemName}
        itemPrice={props.newItemPrice}
        setItemPrice={props.setNewItemPrice}
        itemDescription={props.newItemDescription}
        setItemDescription={props.setNewItemDescription}
        onSave={props.onSaveMenuItem}
      />

      <EditMenuModal
        visible={props.menuEditModalVisible}
        onClose={props.resetMenuModal}
        menuName={props.editMenuName}
        setMenuName={props.setEditMenuName}
        menuImageUrl={props.editMenuImageUrl}
        setMenuImageUrl={props.setEditMenuImageUrl}
        onSave={props.onUpdateMenu}
      />

      <CreateMenuModal
        visible={props.createMenuModalVisible}
        onClose={props.resetCreateMenuModal}
        menuName={props.newMenuName}
        setMenuName={props.setNewMenuName}
        menuImageUrl={props.newMenuImageUrl}
        setMenuImageUrl={props.setNewMenuImageUrl}
        onCreate={props.onCreateMenu}
      />
    </>
  );
};