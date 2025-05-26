import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface MenuItemModalProps {
  visible: boolean;
  onClose: () => void;
  editingItem: any;
  itemName: string;
  setItemName: (name: string) => void;
  itemPrice: string;
  setItemPrice: (price: string) => void;
  itemDescription: string;
  setItemDescription: (desc: string) => void;
  onSave: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  visible,
  onClose,
  editingItem,
  itemName,
  setItemName,
  itemPrice,
  setItemPrice,
  itemDescription,
  setItemDescription,
  onSave,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </Text>
          
          <TextInput
            placeholder="Item name"
            value={itemName}
            onChangeText={setItemName}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Price"
            value={itemPrice}
            onChangeText={setItemPrice}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          
          <TextInput
            placeholder="Description (optional)"
            value={itemDescription}
            onChangeText={setItemDescription}
            multiline
            style={[styles.input, styles.textArea]}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    color: '#888',
  },
  saveButton: {
    backgroundColor: '#F28C28',
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});