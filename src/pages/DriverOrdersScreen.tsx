import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { OrderItemCard } from '../components/driver/OrderItemCard';
import { OrderFilterBar } from '../components/driver/OrderFilterBar';
import { OrderStatsSummary } from '../components/driver/OrderStatsSummary';
import { 
  getCurrentUser, 
  fetchTrucks
} from '../api/appwrite';

// Import these separately to handle possible undefined errors
let fetchOrders, updateOrderStatus, cancelOrder;
try {
  const api = require('../api/appwrite');
  fetchOrders = api.fetchOrders;
  updateOrderStatus = api.updateOrderStatus;
  cancelOrder = api.cancelOrder;
} catch (error) {
  console.warn('Order API functions not available:', error);
  
  // Define fallbacks for development
  fetchOrders = async (truckId) => {
    console.log('Using mock fetchOrders for truck:', truckId);
    return [];
  };
  
  updateOrderStatus = async (orderId, status) => {
    console.log('Using mock updateOrderStatus:', orderId, status);
    return { $id: orderId, status };
  };
  
  cancelOrder = async (orderId) => {
    console.log('Using mock cancelOrder:', orderId);
    return { success: true };
  };
}

export default function DriverOrdersScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [originalOrders, setOriginalOrders] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [userTrucks, setUserTrucks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Order stats
  const [stats, setStats] = useState({
    new: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  });
  
  // Filter options
  const truckOptions = [
    { value: 'all', label: 'All Trucks' },
    ...userTrucks.map(truck => ({ value: truck.$id || truck.id, label: truck.truck_name }))
  ];
  
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' }
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount-high', label: 'Amount: High to Low' },
    { value: 'amount-low', label: 'Amount: Low to High' }
  ];
  
  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, loading orders');
      loadOrders();
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  
  // Initial load
  useEffect(() => {
    console.log('Initial load');
    loadOrders();
  }, []);
  
  // Apply filters when criteria change
  useEffect(() => {
    filterAndSortOrders();
  }, [selectedTruck, selectedStatus, selectedSort, searchQuery, originalOrders]);
  
  // Main function to load orders from API
  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.$id);
      
      // Load user's trucks
      const userTrucksData = await fetchTrucks(user.$id);
      console.log("User trucks loaded:", userTrucksData?.length || 0);
      
      if (!userTrucksData || userTrucksData.length === 0) {
        console.log("No trucks found for user");
        setUserTrucks([]);
        setOriginalOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      setUserTrucks(userTrucksData);
      
      // Create a lookup map for quick truck access by ID
      const trucksMap = {};
      userTrucksData.forEach(truck => {
        const truckId = truck.$id || truck.id;
        trucksMap[truckId] = truck;
      });
      
      // Get truck IDs for filtering orders
      const truckIds = userTrucksData.map((truck: any) => truck.$id || truck.id);
      
      // Fetch orders for user's trucks
      let allOrders: any[] = [];
      
      // For each truck, fetch its orders
      for (const truckId of truckIds) {
        try {
          console.log(`Fetching orders for truck: ${truckId}`);
          const truckOrders = await fetchOrders(truckId);
          console.log(`Found ${truckOrders?.length || 0} orders for truck ${truckId}`);
          
          if (truckOrders && truckOrders.length > 0) {
            allOrders = [...allOrders, ...truckOrders];
          }
        } catch (err) {
          console.error(`Error fetching orders for truck ${truckId}:`, err);
        }
      }
      
      console.log(`Total orders fetched: ${allOrders.length}`);
      
      // Process orders to ensure they have the required format for OrderItemCard
      const processedOrders = allOrders.map(order => {
        // Get truck details - either from the enriched data or from our trucks map
        let truckName = 'Unknown Truck';
        let truckId = '';
        
        if (order.truck_details) {
          // Use the enriched data from fetchOrders
          truckName = order.truck_details.truck_name || 'Unknown Truck';
          truckId = order.truck_details.$id;
        } else if (order.truck_id) {
          // Handle relationship object format
          if (typeof order.truck_id === 'object' && order.truck_id.$id) {
            truckId = order.truck_id.$id;
            const truck = trucksMap[truckId];
            if (truck) {
              truckName = truck.truck_name || 'Unknown Truck';
            }
          } else {
            // Direct ID reference
            truckId = order.truck_id;
            const truck = trucksMap[truckId];
            if (truck) {
              truckName = truck.truck_name || 'Unknown Truck';
            }
          }
        }
        
        // Format order items - use processed_menu_items from fetchOrders if available
        let items = [];
        if (order.processed_menu_items && Array.isArray(order.processed_menu_items)) {
          items = order.processed_menu_items;
        } else if (order.menu_items) {
          // Try to extract from raw menu_items relationship
          if (Array.isArray(order.menu_items)) {
            items = order.menu_items.map(item => {
              if (typeof item === 'object') {
                // It's a relationship object
                return {
                  name: item.name || 'Menu item',
                  quantity: item.quantity || 1,
                  price: item.price || 0
                };
              }
              return { name: 'Unknown item', quantity: 1 };
            });
          }
        }
        
        // Get total cost - make sure it's a number
        const totalCost = typeof order.total_cost === 'string' 
          ? parseFloat(order.total_cost) 
          : (typeof order.total_cost === 'number' ? order.total_cost : 0);
        
        // Get customer info
        let customerName = 'Customer';
        let paymentMethod = 'card';
        
        if (order.customer_details) {
          customerName = order.customer_details.user_name || 
                        order.customer_details.email || 
                        'Customer';
        } else if (order.customer_id && typeof order.customer_id === 'object') {
          customerName = order.customer_id.user_name || 
                        order.customer_id.email || 
                        'Customer';
        }
        
        console.log('Processed order:', {
          id: order.$id,
          status: order.status,
          truckId,
          truckName,
          total: totalCost,
          itemsCount: items.length
        });
        
        // Return the formatted order object for the OrderItemCard
        return {
          id: order.$id,
          status: order.status || 'new',
          customer: {
            name: customerName,
            paymentMethod: paymentMethod
          },
          truck: {
            name: truckName,
            id: truckId
          },
          items: items,
          specialInstructions: order.note || '',
          createdAt: order.created_at,
          estimatedTime: order.created_at, // Use created_at if no estimated time
          total: totalCost,
          originalData: order
        };
      });
      
      setOriginalOrders(processedOrders);
      
      // Calculate stats
      const newStats = {
        new: processedOrders.filter(order => order.status === 'new').length,
        preparing: processedOrders.filter(order => order.status === 'preparing').length,
        ready: processedOrders.filter(order => order.status === 'ready').length,
        completed: processedOrders.filter(order => order.status === 'completed').length
      };
      setStats(newStats);
      
      // Apply initial filtering
      filterAndSortOrders(processedOrders);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Helper function to generate mock orders for testing
  const getMockOrders = (trucks: any[]) => {
    if (!trucks || trucks.length === 0) return [];
    
    const statuses = ['new', 'preparing', 'ready', 'completed'];
    const items = [
      [{ name: 'Carnitas Taco', quantity: 2 }, { name: 'Guac & Chips' }, { name: 'Horchata' }],
      [{ name: 'Classic Burger' }, { name: 'Sweet Potato Fries' }, { name: 'Coke' }],
      [{ name: 'Margherita Pizza', quantity: 1 }, { name: 'Caesar Salad' }],
      [{ name: 'Chicken Bowl' }, { name: 'Tortilla Soup' }, { name: 'Churros', quantity: 2 }]
    ];
    
    return Array(10).fill(0).map((_, index) => {
      const truckIndex = index % trucks.length;
      const truck = trucks[truckIndex];
      const statusIndex = index % statuses.length;
      const itemsIndex = index % items.length;
      
      return {
        $id: `mock-${index + 1000}`,
        status: statuses[statusIndex],
        customer_name: `Test Customer ${index + 1}`,
        payment_method: index % 2 === 0 ? 'card' : 'cash',
        truck_id: truck.$id || truck.id,
        items: items[itemsIndex],
        special_instructions: index % 3 === 0 ? 'Extra spicy' : '',
        created_at: new Date(Date.now() - index * 1000 * 60 * 15).toISOString(),
        total_amount: (10 + index * 2.5).toFixed(2)
      };
    });
  };
  
  // Filter and sort orders based on selected criteria

  const filterAndSortOrders = () => {
    let filtered = [...originalOrders];
    
    // Apply truck filter
    if (selectedTruck !== 'all') {
      filtered = filtered.filter(order => order.truck.id === selectedTruck);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const matchesName = order.customer.name.toLowerCase().includes(query);
        const matchesId = order.id.toString().includes(query);
        return matchesName || matchesId;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high':
          return b.total - a.total;
        case 'amount-low':
          return a.total - b.total;
        default:
          return 0;
      }
    });
    
    setOrders(filtered);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };
  
  const updateStats = (oldStatus: string, newStatus: string) => {
    setStats(prevStats => {
      const updated = { ...prevStats };
      if (oldStatus in updated) {
        updated[oldStatus as keyof typeof updated] -= 1;
      }
      if (newStatus in updated) {
        updated[newStatus as keyof typeof updated] += 1;
      }
      return updated;
    });
  };
  
  const handleMarkReady = (orderId: string) => {
    Alert.alert('Confirm', 'Mark this order as Ready?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Mark Ready', 
        onPress: async () => {
          try {
            setLoading(true);
            // Get the order
            const order = originalOrders.find(o => o.id === orderId);
            if (!order) {
              setLoading(false);
              return;
            }
            
            // Update in backend
            await updateOrderStatus(orderId, 'ready');
            console.log('Order marked ready:', orderId);
            
            // Update locally
            const updatedOrders = originalOrders.map(o => 
              o.id === orderId ? { ...o, status: 'ready' } : o
            );
            setOriginalOrders(updatedOrders);
            
            // Update stats
            setStats(prev => ({
              ...prev,
              preparing: Math.max(0, prev.preparing - 1),
              ready: prev.ready + 1
            }));
            
          } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };
  
  const handleCompleteOrder = (orderId: string) => {
    Alert.alert('Confirm', 'Mark this order as Completed?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Complete', 
        onPress: async () => {
          try {
            setLoading(true);
            // Get the order
            const order = originalOrders.find(o => o.id === orderId);
            if (!order) {
              setLoading(false);
              return;
            }
            
            // Update in backend
            await updateOrderStatus(orderId, 'completed');
            console.log('Order completed:', orderId);
            
            // Update locally
            const updatedOrders = originalOrders.map(o => 
              o.id === orderId ? { ...o, status: 'completed' } : o
            );
            setOriginalOrders(updatedOrders);
            
            // Update stats
            setStats(prev => ({
              ...prev,
              ready: Math.max(0, prev.ready - 1),
              completed: prev.completed + 1
            }));
            
          } catch (error) {
            console.error('Error completing order:', error);
            Alert.alert('Error', 'Failed to complete order');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };
  
  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel Order', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Get the order
              const orderToCancel = originalOrders.find(o => o.id === orderId);
              if (!orderToCancel) {
                setLoading(false);
                return;
              }
              
              // Update in backend
              await cancelOrder(orderId);
              console.log('Order cancelled:', orderId);
              
              // Remove from local state
              const updatedOrders = originalOrders.filter(o => o.id !== orderId);
              setOriginalOrders(updatedOrders);
              
              // Update stats
              const status = orderToCancel.status;
              setStats(prev => ({
                ...prev,
                [status]: Math.max(0, prev[status as keyof typeof prev] - 1)
              }));
              
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // The return function of the component

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
      >
        {/* Order statistics summary */}
        <OrderStatsSummary stats={stats} />
        
        {/* Filters */}
        <OrderFilterBar
          filters={showFilters}
          searchQuery={searchQuery}
          selectedTruck={selectedTruck}
          selectedStatus={selectedStatus}
          selectedSort={selectedSort}
          onFilterToggle={() => setShowFilters(!showFilters)}
          onSearchChange={setSearchQuery}
          onTruckChange={setSelectedTruck}
          onStatusChange={setSelectedStatus}
          onSortChange={setSelectedSort}
          truckOptions={[
            { value: 'all', label: 'All Trucks' },
            ...userTrucks.map(truck => ({ 
              value: truck.$id || truck.id, 
              label: truck.truck_name || truck.name || 'Unknown Truck'
            }))
          ]}
          statusOptions={[
            { value: 'all', label: 'All Statuses' },
            { value: 'new', label: 'New' },
            { value: 'processing', label: 'Processing' },
            { value: 'preparing', label: 'Preparing' },
            { value: 'ready', label: 'Ready' },
            { value: 'completed', label: 'Completed' }
          ]}
          sortOptions={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'amount-high', label: 'Amount: High to Low' },
            { value: 'amount-low', label: 'Amount: Low to High' }
          ]}
        />
        
        {/* Loading indicator */}
        {loading && (
          <ActivityIndicator 
            size="large" 
            color="#FF6B6B" 
            style={styles.loadingIndicator} 
          />
        )}
        
        {/* Orders list */}
        {!loading && orders.length > 0 ? (
          orders.map(order => (
            <OrderItemCard
              key={order.id}
              order={order}
              onMarkReady={() => handleMarkReady(order.id)}
              onCompleteOrder={() => handleCompleteOrder(order.id)}
              onCancelOrder={() => handleCancelOrder(order.id)}
            />
          ))
        ) : !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders match your filters</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the component

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});