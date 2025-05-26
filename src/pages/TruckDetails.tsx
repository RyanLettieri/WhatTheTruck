import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Switch,
  Image,
  Alert,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { 
  fetchTruckById, 
  updateTruckAvailability, 
  fetchMenusByTruckId, 
  fetchMenuItemsByMenuId, 
  fetchReviewsByTruckId, 
  createMenu, 
  createMenuItem, 
  updateMenuItem,
  updateMenu
} from '../api/appwrite';
import { Ionicons } from '@expo/vector-icons';

export default function TruckDetails({ route, navigation }: any) {
  const { truck } = route.params || {};
  const [truckData, setTruckData] = useState<any>(truck);
  const [loading, setLoading] = useState(!truck);
  const [updating, setUpdating] = useState(false);
  
  const [menusData, setMenusData] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  
  // Modal states
  const [menuItemModalVisible, setMenuItemModalVisible] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  
  const [menuEditModalVisible, setMenuEditModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [editMenuName, setEditMenuName] = useState('');
  const [editMenuImageUrl, setEditMenuImageUrl] = useState('');
  
  const [createMenuModalVisible, setCreateMenuModalVisible] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuImageUrl, setNewMenuImageUrl] = useState('');
  
  // Track which menu we're adding items to
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Track expanded menu sections
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Image validation helper function
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    
    // Make sure URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const loadTruckDetails = useCallback(async () => {
    if (!truck || !truck.id) {
      setTruckData(null);
      setMenusData([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch truck data
      const fetchedTruckData = await fetchTruckById(truck.id);
      setTruckData(fetchedTruckData);

      if (fetchedTruckData) {
        // Fetch menus for this truck
        const fetchedMenus = await fetchMenusByTruckId(fetchedTruckData.id);
        
        // Enhanced logging
        console.log('=== MENU IMAGE DEBUG ===');
        fetchedMenus.forEach((menu, index) => {
          console.log(`Menu ${index + 1}: ${menu.name}`);
          console.log(`  ID: ${menu.id}`);
          console.log(`  Image URL: ${menu.image_url || 'NO IMAGE'}`);
          if (menu.image_url) {
            console.log(`  Valid URL: ${isValidImageUrl(menu.image_url)}`);
          }
        });
        console.log('=======================');
        
        // For each menu, fetch its items
        const menusWithItems = await Promise.all(
          fetchedMenus.map(async (menu: any) => {
            const items = await fetchMenuItemsByMenuId(menu.id);
            return { ...menu, items: items || [] };
          })
        );
        
        setMenusData(menusWithItems);
        
        // Fetch reviews
        const fetchedReviews = await fetchReviewsByTruckId(fetchedTruckData.id);
        setReviews(fetchedReviews);
      } else {
        setMenusData([]);
        setReviews([]);
      }
    } catch (error) {
      console.error("Error loading truck details:", error);
      setTruckData(null);
      setMenusData([]);
      setReviews([]);
      Alert.alert("Error", "Could not load truck details.");
    } finally {
      setLoading(false);
    }
  }, [truck]);

  useEffect(() => {
    loadTruckDetails();
  }, [loadTruckDetails]);

  const handleToggleAvailable = async (value: boolean) => {
    if (!truckData) return;
    setUpdating(true);
    const updated = await updateTruckAvailability(truckData.id, value);
    if (updated) {
      setTruckData({ ...truckData, available: value });
    } else {
      Alert.alert('Error', 'Failed to update availability.');
    }
    setUpdating(false);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  const handleAddMenu = () => {
    setCreateMenuModalVisible(true);
  };

  const handleCreateMenu = async () => {
    if (!truckData || !newMenuName.trim()) {
      Alert.alert('Error', 'Menu name is required.');
      return;
    }

    // Validate image URL if provided
    if (newMenuImageUrl && !isValidImageUrl(newMenuImageUrl)) {
      Alert.alert(
        'Invalid Image URL', 
        'Please enter a valid URL starting with http:// or https://'
      );
      return;
    }

    try {
      const menu = await createMenu(truckData.id, newMenuName.trim(), newMenuImageUrl.trim() || undefined);
      if (menu) {
        setMenusData([...menusData, { ...menu, items: [] }]);
        setCreateMenuModalVisible(false);
        setNewMenuName('');
        setNewMenuImageUrl('');
        Alert.alert('Success', 'Menu created successfully');
      } else {
        Alert.alert('Error', 'Failed to create menu');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the menu.');
    }
  };

  const openEditMenuModal = (menu: any) => {
    setEditingMenu(menu);
    setEditMenuName(menu.name);
    setEditMenuImageUrl(menu.image_url || '');
    setMenuEditModalVisible(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu || !editMenuName.trim()) {
      Alert.alert('Error', 'Menu name cannot be empty.');
      return;
    }

    // Validate image URL if provided
    if (editMenuImageUrl && !isValidImageUrl(editMenuImageUrl)) {
      Alert.alert(
        'Invalid Image URL', 
        'Please enter a valid URL starting with http:// or https://'
      );
      return;
    }

    try {
      const updatedMenu = await updateMenu(editingMenu.id, {
        name: editMenuName.trim(),
        image_url: editMenuImageUrl.trim() || undefined,
      });

      if (updatedMenu) {
        setMenusData(prevMenusData =>
          prevMenusData.map(menu =>
            menu.id === editingMenu.id 
              ? { ...menu, name: updatedMenu.name, image_url: updatedMenu.image_url }
              : menu
          )
        );
        setMenuEditModalVisible(false);
        setEditingMenu(null);
        setEditMenuName('');
        setEditMenuImageUrl('');
        Alert.alert('Success', 'Menu updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update menu.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the menu.');
    }
  };

  const openAddItemModal = (menuId: string) => {
    setActiveMenuId(menuId);
    setEditingMenuItem(null);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('');
    setMenuItemModalVisible(true);
  };

  const openEditItemModal = (item: any, menuId: string) => {
    setActiveMenuId(menuId);
    setEditingMenuItem(item);
    setNewItemName(item.name);
    setNewItemPrice(item.price.toString());
    setNewItemDescription(item.description || '');
    setMenuItemModalVisible(true);
  };

  const handleSaveMenuItem = async () => {
    if (!newItemName || !newItemPrice) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    if (!activeMenuId && !editingMenuItem) {
      Alert.alert('Error', 'No menu selected');
      return;
    }

    try {
      if (editingMenuItem) {
        // Update existing item
        const updatedItem = await updateMenuItem(editingMenuItem.id, {
          name: newItemName,
          price: parseFloat(newItemPrice),
          description: newItemDescription,
        });

        if (updatedItem) {
          setMenusData(prevMenusData =>
            prevMenusData.map(menu =>
              menu.items.some((item: any) => item.id === editingMenuItem.id)
                ? { ...menu, items: menu.items.map((item: any) => item.id === updatedItem.id ? updatedItem : item) }
                : menu
            )
          );
          Alert.alert('Success', 'Menu item updated');
        }
      } else if (activeMenuId) {
        // Add new item
        const menuItem = await createMenuItem(
          activeMenuId,
          newItemName,
          parseFloat(newItemPrice),
          newItemDescription
        );

        if (menuItem) {
          setMenusData(prevMenusData =>
            prevMenusData.map(menu =>
              menu.id === activeMenuId
                ? { ...menu, items: [...menu.items, menuItem] }
                : menu
            )
          );
          Alert.alert('Success', 'Menu item added');
        }
      }

      setMenuItemModalVisible(false);
      setActiveMenuId(null);
      setEditingMenuItem(null);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save menu item');
    }
  };

  // Toggle menu expansion
  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  if (loading) return <ActivityIndicator size="large" color="#F28C28" style={{ flex: 1, justifyContent: 'center' }} />;
  if (!truckData) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Truck not found.</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{truckData.truck_name}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DriverDashboard')}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={24} color="#F28C28" />
            <Text style={styles.locationText}>Current Location</Text>
          </View>
          <TouchableOpacity style={styles.updateButton}>
            <Text style={styles.updateButtonText}>Update Location</Text>
          </TouchableOpacity>
        </View>

        {/* Menus Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menus</Text>
          <TouchableOpacity onPress={handleAddMenu} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {menusData.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No menus yet. Click the '+' icon to add a menu.</Text>
          </View>
        ) : (
          menusData.map((menu) => (
            <View key={menu.id} style={styles.card}>
              <TouchableOpacity 
                style={styles.menuHeader}
                onPress={() => toggleMenuExpansion(menu.id)}
              >
                <Text style={styles.menuTitle}>{menu.name}</Text>
                <View style={styles.menuActions}>
                  <TouchableOpacity onPress={() => openEditMenuModal(menu)} style={styles.iconButton}>
                    <Ionicons name="pencil" size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openAddItemModal(menu.id)} style={styles.iconButton}>
                    <Ionicons name="add" size={22} color="#F28C28" />
                  </TouchableOpacity>
                  <Ionicons 
                    name={expandedMenus[menu.id] ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </View>
              </TouchableOpacity>

              {/* Menu Image with better error handling */}
              {menu.image_url && (
                <View style={styles.menuImageContainer}>
                  <Image 
                    source={{ uri: menu.image_url }} 
                    style={styles.menuImage}
                    resizeMode="cover"
                    onError={(e) => {
                      console.error(`Failed to load image for menu "${menu.name}":`, menu.image_url);
                      console.error('Error details:', e.nativeEvent.error);
                    }}
                    onLoad={() => {
                      console.log(`Successfully loaded image for menu "${menu.name}"`);
                    }}
                  />
                </View>
              )}

              {/* Menu Items */}
              {expandedMenus[menu.id] && (
                <>
                  {menu.items && menu.items.length > 0 ? (
                    menu.items.map((item: any) => (
                      <TouchableOpacity 
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => openEditItemModal(item, menu.id)}
                      >
                        <View style={styles.menuItemContent}>
                          <View style={styles.menuItemMain}>
                            <Text style={styles.menuItemName}>{item.name}</Text>
                            <Text style={styles.menuItemDescription}>
                              {item.description || "Food Item"}
                            </Text>
                          </View>
                          <View style={styles.menuItemSide}>
                            <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                            <TouchableOpacity onPress={() => openEditItemModal(item, menu.id)}>
                              <Ionicons name="pencil" size={16} color="#999" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No items in this menu yet.</Text>
                  )}
                </>
              )}
            </View>
          ))
        )}

        {/* Availability Section */}
        <View style={styles.card}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.availabilityTitle}>Availability</Text>
            <Switch
              value={!!truckData.available}
              onValueChange={handleToggleAvailable}
              disabled={updating}
              trackColor={{ false: '#e0e0e0', true: '#b8e0d2' }}
              thumbColor={truckData.available ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>42</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$560.75</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Cheeseburger</Text>
              <Text style={styles.statLabel}>Most Popular</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.reviewsFilter}>
            <TouchableOpacity onPress={() => setSortBy('recent')}>
              <Text style={sortBy === 'recent' ? styles.filterActive : styles.filterInactive}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortBy('rating')}>
              <Text style={sortBy === 'rating' ? styles.filterActive : styles.filterInactive}>Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.emptyReviews}>
              <Ionicons name="star" size={32} color="#F5CB5C" />
              <Text style={styles.emptyText}>No reviews yet</Text>
            </View>
          </View>
        ) : (
          sortedReviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.user_name || 'Anonymous'}</Text>
                <View style={styles.ratingContainer}>
                  {[...Array(review.rating || 0)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#F28C28" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))
        )}

        {/* Menu Item Modal */}
        <Modal
          visible={menuItemModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </Text>
              <TextInput
                placeholder="Item name"
                value={newItemName}
                onChangeText={setNewItemName}
                style={styles.input}
              />
              <TextInput
                placeholder="Price"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              <TextInput
                placeholder="Description (optional)"
                value={newItemDescription}
                onChangeText={setNewItemDescription}
                multiline
                style={[styles.input, styles.textArea]}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  onPress={() => {
                    setMenuItemModalVisible(false);
                    setActiveMenuId(null);
                    setEditingMenuItem(null);
                    setNewItemName('');
                    setNewItemPrice('');
                    setNewItemDescription('');
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSaveMenuItem}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* CREATE MENU MODAL - ADD THIS NEW MODAL */}
        <Modal
          visible={createMenuModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCreateMenuModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Menu</Text>
              
              <TextInput
                placeholder="Menu Name"
                value={newMenuName}
                onChangeText={setNewMenuName}
                style={styles.input}
              />
              
              <TextInput
                placeholder="Menu Image URL (optional)"
                value={newMenuImageUrl}
                onChangeText={setNewMenuImageUrl}
                style={styles.input}
              />
              
              {newMenuImageUrl && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#666', marginBottom: 8 }}>Preview:</Text>
                  <Image 
                    source={{ uri: newMenuImageUrl }} 
                    style={{ width: '100%', height: 120, borderRadius: 8 }}
                    onError={() => Alert.alert('Error', 'Invalid image URL')}
                  />
                </View>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setCreateMenuModalVisible(false);
                    setNewMenuName('');
                    setNewMenuImageUrl('');
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateMenu}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Create Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Menu Modal - existing */}
        <Modal
          visible={menuEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setMenuEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Menu</Text>
              
              <TextInput
                placeholder="Menu Name"
                value={editMenuName}
                onChangeText={setEditMenuName}
                style={styles.input}
              />
              
              <TextInput
                placeholder="Menu Image URL (optional)"
                value={editMenuImageUrl}
                onChangeText={setEditMenuImageUrl}
                style={styles.input}
              />
              
              {editMenuImageUrl && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#666', marginBottom: 8 }}>Preview:</Text>
                  <Image 
                    source={{ uri: editMenuImageUrl }} 
                    style={{ width: '100%', height: 120, borderRadius: 8 }}
                    onError={() => Alert.alert('Error', 'Invalid image URL')}
                  />
                </View>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setMenuEditModalVisible(false);
                    setEditingMenu(null);
                    setEditMenuName('');
                    setEditMenuImageUrl('');
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdateMenu}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Footer Space for Tab Navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#F28C28',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
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
  },
  menuActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  menuItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
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
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reviewsFilter: {
    flexDirection: 'row',
  },
  filterActive: {
    color: '#F28C28',
    marginLeft: 12,
    fontWeight: '500',
  },
  filterInactive: {
    color: '#888',
    marginLeft: 12,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
  },
  // Keep your existing modal styles
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
  },
  textArea: {
    height: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  // Add this style for menu images
  menuImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  menuImageContainer: {
    overflow: 'hidden',
    borderRadius: 8,
    marginBottom: 12,
  },
});