import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { isValidImageUrl } from '../../../utils/validation';

interface EditMenuModalProps {
  visible: boolean;
  onClose: () => void;
  menuName: string;
  setMenuName: (name: string) => void;
  menuImageUrl: string;
  setMenuImageUrl: (url: string) => void;
  onSave: () => void;
}

export const EditMenuModal: React.FC<EditMenuModalProps> = ({
  visible,
  onClose,
  menuName,
  setMenuName,
  menuImageUrl,
  setMenuImageUrl,
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
          <Text style={styles.modalTitle}>Edit Menu</Text>
          
          <TextInput
            placeholder="Menu Name"
            value={menuName}
            onChangeText={setMenuName}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Menu Image URL (optional)"
            value={menuImageUrl}
            onChangeText={setMenuImageUrl}
            style={styles.input}
          />
          <Text style={styles.inputHelper}>
            Must start with http:// or https://
          </Text>
          
          {menuImageUrl && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <View style={styles.imagePreview}>
                {isValidImageUrl(menuImageUrl) ? (
                  <Image 
                    source={{ uri: menuImageUrl }} 
                    style={styles.previewImage}
                    onError={() => {
                      Alert.alert('Error', 'Could not load image from the provided URL');
                    }}
                  />
                ) : (
                  <Text style={styles.invalidUrlText}>Invalid image URL</Text>
                )}
              </View>
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
  inputHelper: {
    color: '#888',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  previewLabel: {
    color: '#666',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  invalidUrlText: {
    color: '#999',
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