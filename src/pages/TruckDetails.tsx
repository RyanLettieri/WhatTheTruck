import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Text,
  ScrollView,
  SafeAreaView,
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateTruckAvailability, fetchTruckOrders, updateOrderStatus } from '../api/appwrite';

// Components
import { TruckHeader } from '../components/truck/TruckHeader';
import { LocationCard } from '../components/truck/LocationCard';
import { MenuSection } from '../components/truck/MenuSection/MenuSection';
import { AvailabilityCard } from '../components/truck/AvailabilityCard';
import { ReviewsSection } from '../components/truck/ReviewsSection';
import { MenuModals } from '../components/truck/modals/MenuModals';
import { OrderCard } from '../components/truck/OrderCard';

// Hooks
import { useTruckDetails } from '../hooks/useTruckDetails';
import { useModals } from '../hooks/useModals';
import { useMenuHandlers } from '../hooks/useMenuHandlers';

export default function TruckDetails({ route, navigation }: any) {
  const { truck, initialTab } = route.params || {};
  const [updating, setUpdating] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [activeTab, setActiveTab] = useState(initialTab || 'orders');
  
  // Separate state for all orders and filtered orders
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Use custom hooks
  const { truckData, loading: loadingTruck, menusData, reviews, setTruckData, setMenusData } = useTruckDetails(truck);
  const modals = useModals();
  const menuHandlers = useMenuHandlers(truckData, menusData, setMenusData, modals);

  useEffect(() => {
    if (truckData) {
      loadOrders();
    }
  }, [truckData, orderFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (!truckData) return;
      
      const truckOrders = await fetchTruckOrders(truckData.id);
      
      // Store all orders
      setAllOrders(truckOrders);
      
      // Filter orders based on current status filter
      const filteredOrders = truckOrders.filter(order => {
        if (orderFilter === 'pending') return order.status === 'pending';
        if (orderFilter === 'processing') return order.status === 'processing';
        if (orderFilter === 'ready') return order.status === 'ready';
        return true;
      });
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  const handleOrderAction = async (orderId, newStatus) => {
    try {
      // Update status via API
      const updated = await updateOrderStatus(orderId, newStatus);
      
      if (updated) {
        // Update allOrders state
        const updatedAllOrders = allOrders.map(order => 
          order.id === orderId ? {...order, status: newStatus} : order
        );
        setAllOrders(updatedAllOrders);
        
        // Update filtered orders state
        const updatedOrders = orders.map(order => 
          order.id === orderId ? {...order, status: newStatus} : order
        ).filter(order => {
          // Keep only orders that match the current filter
          if (orderFilter === 'pending') return order.status === 'pending';
          if (orderFilter === 'processing') return order.status === 'processing';
          if (orderFilter === 'ready') return order.status === 'ready';
          return true;
        });
        
        setOrders(updatedOrders);
        
        // Show success message
        Alert.alert('Success', `Order #${orderId.slice(-3).padStart(3, '0')} updated to ${newStatus}`);
      } else {
        Alert.alert('Error', 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };
  
  if (loadingTruck) return <ActivityIndicator size="large" color="#F28C28" style={{ flex: 1, justifyContent: 'center' }} />;
  if (!truckData) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Truck not found.</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <TruckHeader 
        truckName={truckData.truck_name}
        onProfilePress={() => navigation.navigate('DriverDashboard')}
      />
      
      <LocationCard 
        location={truckData.location}
        onUpdateLocation={() => navigation.navigate('UpdateLocation', { truck: truckData })}
      />
      
      <View style={styles.availabilityToggle}>
        <Text style={styles.availabilityText}>Available for Orders</Text>
        <Switch 
          value={truckData.available}
          onValueChange={handleToggleAvailable}
          trackColor={{ false: '#e0e0e0', true: '#4cd964' }}
          thumbColor={truckData.available ? '#ffffff' : '#f4f3f4'}
          disabled={updating}
        />
      </View>
      
      {/* Tabs for Order Management, Menus, and Analytics */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]} 
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'menus' && styles.activeTab]} 
          onPress={() => setActiveTab('menus')}
        >
          <Text style={[styles.tabText, activeTab === 'menus' && styles.activeTabText]}>Menus</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]} 
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'orders' && (
        <>
          {/* Order Status Filters */}
          <View style={styles.orderFilterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, orderFilter === 'pending' && styles.activeFilterButton]}
              onPress={() => setOrderFilter('pending')}
            >
              <Text style={[styles.filterText, orderFilter === 'pending' && styles.activeFilterText]}>
                Pending ({allOrders.filter(o => o.status === 'pending').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, orderFilter === 'processing' && styles.activeFilterButton]}
              onPress={() => setOrderFilter('processing')}
            >
              <Text style={[styles.filterText, orderFilter === 'processing' && styles.activeFilterText]}>
                Processing ({allOrders.filter(o => o.status === 'processing').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, orderFilter === 'ready' && styles.activeFilterButton]}
              onPress={() => setOrderFilter('ready')}
            >
              <Text style={[styles.filterText, orderFilter === 'ready' && styles.activeFilterText]}>
                Ready ({allOrders.filter(o => o.status === 'ready').length})
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Orders List */}
          <ScrollView style={styles.orderList}>
            {loading ? (
              <ActivityIndicator size="large" color="#F28C28" style={styles.loader} />
            ) : orders.length === 0 ? (
              <View style={styles.noOrders}>
                <Ionicons name="fast-food-outline" size={50} color="#ccc" />
                <Text style={styles.noOrdersText}>No {orderFilter} orders</Text>
              </View>
            ) : (
              orders.map(order => (
                <OrderCard 
                  key={order.id}
                  order={order}
                  onAccept={() => handleOrderAction(order.id, 'processing')}
                  onComplete={() => handleOrderAction(order.id, 'ready')}
                />
              ))
            )}
          </ScrollView>
        </>
      )}
      
      {activeTab === 'menus' && (
        <ScrollView style={styles.content}>
          <MenuSection
            menus={menusData}
            expandedMenus={expandedMenus}
            onToggleExpansion={toggleMenuExpansion}
            onAddMenu={() => modals.setCreateMenuModalVisible(true)}
            onEditMenu={menuHandlers.openEditMenuModal}
            onDeleteMenu={menuHandlers.handleDeleteMenu}
            onAddMenuItem={menuHandlers.openAddItemModal}
            onEditMenuItem={menuHandlers.openEditItemModal}
            onDeleteMenuItem={menuHandlers.handleDeleteMenuItem}
          />
        </ScrollView>
      )}
      
      {activeTab === 'analytics' && (
        <ScrollView style={styles.content}>
          <View style={styles.analyticsPlaceholder}>
            <Ionicons name="bar-chart-outline" size={60} color="#ccc" />
            <Text style={styles.analyticsText}>Analytics Coming Soon</Text>
          </View>
        </ScrollView>
      )}
      
      <MenuModals
        {...modals}
        onSaveMenuItem={menuHandlers.handleSaveMenuItem}
        onCreateMenu={menuHandlers.handleCreateMenu}
        onUpdateMenu={menuHandlers.handleUpdateMenu}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#F28C28',
  },
  tabText: {
    fontSize: 15,
    color: '#777',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#F28C28',
  },
  content: {
    flex: 1,
  },
  orderFilterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#F28C28',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  orderList: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  noOrders: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  noOrdersText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  analyticsPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  analyticsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
});