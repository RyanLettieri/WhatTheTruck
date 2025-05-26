import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, fetchUserOrders, fetchTruckById } from '../api/appwrite';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [truckCache, setTruckCache] = useState({});
  
  const REFRESH_COOLDOWN = 30000; // 30 seconds
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      if (!user) {
        Alert.alert('Error', 'Please sign in to view your orders');
        setLoading(false);
        return;
      }
      
      const userOrders = await fetchUserOrders(user.$id);
      
      // Sort orders by date (newest first)
      userOrders.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Load truck details for each order
      const updatedOrders = await Promise.all(
        userOrders.map(async (order) => {
          // Check if we already have this truck in cache
          if (!truckCache[order.truck_id.id]) {
            const truckDetails = await fetchTruckById(order.truck_id.id);
            if (truckDetails) {
              setTruckCache(prev => ({
                ...prev,
                [order.truck_id.id]: truckDetails
              }));
            }
          }
          return order;
        })
      );
      
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    // Check if we're within the cooldown period
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      const secondsLeft = Math.ceil((REFRESH_COOLDOWN - (now - lastRefreshTime)) / 1000);
      Alert.alert(
        "Please wait",
        `You can refresh again in ${secondsLeft} seconds.`
      );
      return;
    }
    
    setRefreshing(true);
    setLastRefreshTime(now);
    
    try {
      await loadOrders();
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the order date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if the order date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return '#F28C28'; // Orange
      case 'preparing':
        return '#3498db'; // Blue
      case 'ready':
        return '#2ecc71'; // Green
      case 'completed':
        return '#27ae60'; // Darker green
      case 'cancelled':
        return '#e74c3c'; // Red
      default:
        return '#95a5a6'; // Gray
    }
  };
  
  // Update the renderOrderCard function to show individual items
  const renderOrderCard = ({ item }) => {
    const truckDetails = truckCache[item.truck_id.id] || {};
    
    // Determine if the order is "ready" or "preparing" for UI indicators
    const isReady = item.status.toLowerCase() === 'ready';
    const isPreparing = item.status.toLowerCase() === 'preparing';
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { order: item, truck: truckDetails })}
      >
        {/* Order Header - Truck Info and Status */}
        <View style={styles.orderHeader}>
          <View style={styles.truckInfo}>
            {truckDetails.image_url ? (
              <Image source={{ uri: truckDetails.image_url }} style={styles.truckImage} />
            ) : (
              <View style={[styles.truckImage, styles.truckImagePlaceholder]}>
                <Ionicons name="fast-food-outline" size={24} color="#ccc" />
              </View>
            )}
            <View>
              <Text style={styles.truckName}>{truckDetails.truck_name || 'Loading...'}</Text>
              <Text style={styles.orderDate}>Ordered {formatTimeAgo(item.created_at)}</Text>
            </View>
          </View>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        {/* Progress Bar for preparing orders */}
        {isPreparing && (
          <View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.estimatedTime}>Estimated ready in 8 minutes</Text>
          </View>
        )}
        
        {/* Individual Order Items */}
        <View style={styles.itemsList}>
          {Array.isArray(item.menu_items) && item.menu_items.map((menuItem, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>
                  {menuItem.name || `Item ${index + 1}`}
                </Text>
                {menuItem.notes && (
                  <Text style={styles.itemNotes}>{menuItem.notes}</Text>
                )}
              </View>
              <View style={styles.quantityPrice}>
                <Text style={styles.itemQuantity}>×{menuItem.quantity || 1}</Text>
                <Text style={styles.itemPrice}>
                  ${(menuItem.price || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          
          {/* If no menu items are available, show placeholder */}
          {(!item.menu_items || !Array.isArray(item.menu_items) || item.menu_items.length === 0) && (
            <Text style={styles.noItemsText}>Order details loading...</Text>
          )}
        </View>
        
        {/* Order Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${parseFloat(item.total_cost).toFixed(2)}</Text>
        </View>
        
        {/* Order Actions */}
        <View style={styles.orderActions}>
          {item.status === 'processing' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => navigation.navigate('OrderTracking', { order: item, truck: truckDetails })}
            >
              <Ionicons name="location-outline" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Track</Text>
            </TouchableOpacity>
          )}
          
          {isPreparing && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => navigation.navigate('OrderTracking', { order: item, truck: truckDetails })}
            >
              <Ionicons name="navigate-outline" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Track</Text>
            </TouchableOpacity>
          )}
          
          {isReady && (
            <View style={styles.readyActions}>
              <TouchableOpacity style={styles.pickupButton}>
                <Text style={styles.pickupText}>Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {item.status === 'completed' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => navigation.navigate('ReviewOrder', { order: item, truck: truckDetails })}
            >
              <Ionicons name="star-outline" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Leave a Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderOrderSections = () => {
    const activeOrders = orders.filter(order => 
      ['processing', 'preparing', 'ready'].includes(order.status.toLowerCase())
    );
    
    const pastOrders = orders.filter(order => 
      ['completed', 'cancelled'].includes(order.status.toLowerCase())
    );
    
    return (
      <>
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <FlatList
              data={activeOrders}
              keyExtractor={(item) => item.id}
              renderItem={renderOrderCard}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {pastOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order History</Text>
            <FlatList
              data={pastOrders}
              keyExtractor={(item) => item.id}
              renderItem={renderOrderCard}
              scrollEnabled={false}
            />
          </View>
        )}
      </>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F28C28" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>
            Your order history will appear here once you place an order.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.browseButtonText}>Browse Food Trucks</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'sections' }]}
          renderItem={() => renderOrderSections()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F28C28"]}
              tintColor="#F28C28"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  truckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  truckImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsInfo: {
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#555',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
    flex: 1,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  trackButton: {
    backgroundColor: '#F28C28',
  },
  reviewButton: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  readyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyText: {
    color: '#2ecc71',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#F28C28',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    width: '70%', // This should be dynamic based on order progress
    backgroundColor: '#3498db',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
  itemsList: {
    marginTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  quantityPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  noItemsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  readyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pickupButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  pickupText: {
    color: '#FFF',
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  callText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

// Add this helper function for "12 min ago" style timestamps
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  
  // Convert to minutes
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffMins < 1440) { // Less than a day
    return `${Math.floor(diffMins / 60)} hours ago`;
  } else {
    return `${Math.floor(diffMins / 1440)} days ago`;
  }
};