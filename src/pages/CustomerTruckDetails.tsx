import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTruckMenu, addFavorite, fetchUserFavorites, getCurrentUser } from '../api/appwrite';

export default function CustomerTruckDetails({ route, navigation }: any) {
  const { truck } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserId(currentUser.$id);
        
        // Check if this truck is in user's favorites
        const favorites = await fetchUserFavorites(currentUser.$id);
        const found = favorites.some(fav => fav.truck_id === truck.id);
        setIsFavorite(found);
      }
      
      // Fetch menu items for this truck
      const menuItems = await fetchTruckMenu(truck.id);
      setMenuItems(menuItems);
      
      // Get unique categories (menu names)
      const categories = [...new Set(menuItems.map(item => item.category))];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    } catch (error) {
      console.error('Error loading truck details:', error);
      Alert.alert('Error', 'Failed to load truck details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to add favorites.');
      return;
    }

    try {
      await addFavorite(userId, truck.id);
      setIsFavorite(true);
      Alert.alert('Success', 'Added to favorites!');
    } catch (error) {
      console.error('Error adding favorite:', error);
      Alert.alert('Error', 'Failed to add to favorites.');
    }
  };

  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    Alert.alert('Added to Cart', `${item.name} added to your cart`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }
    
    navigation.navigate('Checkout', { 
      cart, 
      truck,
      totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  };

  // Get unique categories from menu items
  const categories = [...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items by selected category
  const filteredMenu = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F28C28" />
        <Text style={styles.loadingText}>Loading truck details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{truck.truck_name}</Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={isFavorite ? () => {} : handleAddToFavorites}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF6B6B" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Banner Image */}
        <Image 
          source={truck.image_url ? { uri: truck.image_url } : require('../../assets/truck-placeholder.png')} 
          style={styles.bannerImage}
        />
        
        {/* Truck Info */}
        <View style={styles.truckInfoContainer}>
          <View style={styles.truckInfo}>
            <Text style={styles.truckName}>{truck.truck_name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, truck.available ? styles.available : styles.unavailable]} />
              <Text style={styles.statusText}>
                {truck.available ? 'Open Now' : 'Closed'}
              </Text>
            </View>
          </View>
          
          {/* Cuisine Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisineContainer}>
            {truck.cuisines && truck.cuisines.map((cuisine: string, index: number) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>
                  {getCuisineEmoji(cuisine)} {cuisine}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          {/* Description */}
          {truck.description && (
            <Text style={styles.description}>{truck.description}</Text>
          )}
          
          {/* Working Hours */}
          <View style={styles.hoursContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.hoursText}>
              {truck.hours || 'Hours not specified'}
            </Text>
          </View>
          
          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>
              {truck.location || 'Location not specified'}
            </Text>
          </View>
        </View>

        {/* Menu Categories */}
        {categories.length > 0 ? (
          <>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              {!truck.available && (
                <Text style={styles.closedText}>This truck is currently closed</Text>
              )}
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((category, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category ? styles.selectedCategory : null
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategory === category ? styles.selectedCategoryText : null
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Menu Items */}
            <View style={styles.menuItemsContainer}>
              {filteredMenu.map((item, index) => (
                <View key={index} style={styles.menuItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.itemActions}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                    ) : (
                      <View style={styles.itemImagePlaceholder} />
                    )}
                    
                    {truck.available && (
                      <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => addToCart(item)}
                      >
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.noMenuContainer}>
            <Ionicons name="restaurant-outline" size={50} color="#CCC" />
            <Text style={styles.noMenuText}>No menu items available</Text>
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Cart Button - only show if cart has items and truck is available */}
      {cart.length > 0 && truck.available && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleCheckout}
        >
          <View style={styles.cartContent}>
            <View style={styles.cartQuantityBadge}>
              <Text style={styles.cartQuantityText}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
            <Text style={styles.cartButtonText}>View Cart</Text>
          </View>
          <Text style={styles.cartPrice}>
            ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// Helper function to get cuisine emoji
const getCuisineEmoji = (cuisine: string) => {
  const cuisineMap: {[key: string]: string} = {
    'mexican': '🌮',
    'asian': '🍜',
    'american': '🍔',
    'italian': '🍕',
    'dessert': '🍩',
    'bbq': '🍖',
    'seafood': '🦞',
    'indian': '🍛',
    'breakfast': '🥞',
    'mediterranean': '🥙',
    'vegan': '🥗',
    'japanese': '🍱'
  };
  
  const lowerCuisine = cuisine.toLowerCase();
  return cuisineMap[lowerCuisine] || '🚚';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#F28C28',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 18,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  truckInfoContainer: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  truckInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  truckName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  cuisineContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cuisineTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
  },
  cuisineText: {
    color: '#666',
    fontSize: 14,
  },
  description: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  menuHeader: {
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closedText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  categoriesScroll: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedCategory: {
    backgroundColor: '#F28C28',
  },
  categoryText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  menuItemsContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F28C28',
  },
  itemActions: {
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#F28C28',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMenuContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noMenuText: {
    marginTop: 8,
    color: '#999',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 80,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#F28C28',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartQuantityBadge: {
    backgroundColor: '#FFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartQuantityText: {
    color: '#F28C28',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cartPrice: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});