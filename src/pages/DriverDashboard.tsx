import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { 
  fetchTrucks, 
  getCurrentUser, 
  fetchProfileById, 
  fetchTruckOrders, // Add this import
  updateTruckAvailability 
} from '../api/appwrite';
import { useFocusEffect } from '@react-navigation/native';

// Components
import { DashboardHeader } from '../components/driver/DashboardHeader';
import { PerformanceCard } from '../components/driver/PerformanceCard';
import { StatusCard } from '../components/driver/StatusCard';
import { TrucksList } from '../components/driver/TrucksList';
import { RecentOrdersList } from '../components/driver/RecentOrdersList';
import { QuickActions } from '../components/driver/QuickActions';

export default function DriverDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrder: 0
  });
  const [updatingTruck, setUpdatingTruck] = useState(null);

  // Add a separate refresh function
  const refreshData = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const userTrucks = await fetchTrucks(user.$id);
        setTrucks(userTrucks);
        
        // Refresh orders
        if (userTrucks.length > 0) {
          let allOrders = [];
          for (const truck of userTrucks) {
            const truckId = truck.$id || truck.id;
            const truckOrders = await fetchTruckOrders(truckId);
            allOrders = [...allOrders, ...truckOrders];
          }
          
          allOrders.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          setRecentOrders(allOrders.slice(0, 5));
          
          // Update metrics
          const today = new Date().toDateString();
          const todaysOrders = allOrders.filter(order => 
            new Date(order.created_at).toDateString() === today
          );
          
          const totalRevenue = todaysOrders.reduce((sum, order) => 
            sum + parseFloat(order.total_cost || 0), 0
          );
          
          setMetrics({
            totalOrders: todaysOrders.length,
            totalRevenue: totalRevenue,
            averageOrder: todaysOrders.length > 0 ? totalRevenue / todaysOrders.length : 0
          });
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // Load current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setLoading(false);
          return;
        }
        setUser(currentUser);
        
        // Load user profile
        const userProfile = await fetchProfileById(currentUser.$id);
        setProfile(userProfile);
        
        // Load user's trucks
        const userTrucks = await fetchTrucks(currentUser.$id);
        setTrucks(userTrucks);
        
        // Load recent orders across all user's trucks
        if (userTrucks.length > 0) {
          let allOrders = [];
          
          // Fetch orders for each truck
          for (const truck of userTrucks) {
            const truckId = truck.$id || truck.id;
            const truckOrders = await fetchTruckOrders(truckId);
            allOrders = [...allOrders, ...truckOrders];
          }
          
          // Sort orders by date (newest first)
          allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // Take most recent 5 orders
          setRecentOrders(allOrders.slice(0, 5));
          
          // Calculate metrics for today
          const today = new Date().toDateString();
          const todaysOrders = allOrders.filter(order => 
            new Date(order.created_at).toDateString() === today
          );
          
          const totalRevenue = todaysOrders.reduce((sum, order) => 
            sum + parseFloat(order.total_cost || 0), 0
          );
          
          setMetrics({
            totalOrders: todaysOrders.length,
            totalRevenue: totalRevenue,
            averageOrder: todaysOrders.length > 0 ? totalRevenue / todaysOrders.length : 0
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Refresh data when the screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        fetchTrucks(user.$id).then(setTrucks);
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  const handleUpdateTruckAvailability = async (truck, newAvailability) => {
    try {
      setUpdatingTruck(truck.id);
      
      const truckId = truck.$id || truck.id;
      const updated = await updateTruckAvailability(truckId, newAvailability);
      
      if (updated) {
        // Update the trucks list with the new availability status
        const updatedTrucks = trucks.map(t => 
          (t.$id || t.id) === truckId 
            ? { ...t, available: newAvailability } 
            : t
        );
        setTrucks(updatedTrucks);
        
        // Show success message
        Alert.alert('Success', `${truck.truck_name} is now ${newAvailability ? 'open' : 'closed'} for orders`);
      } else {
        Alert.alert('Error', 'Failed to update truck availability');
      }
    } catch (error) {
      console.error('Error updating truck availability:', error);
      Alert.alert('Error', 'Something went wrong while updating truck availability');
    } finally {
      setUpdatingTruck(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <DashboardHeader 
          title="WhatTheTruck"
          greeting={`${greeting()} Ready to serve?`}
          notifications={3}
          onNotificationPress={() => navigation.navigate('Notifications')}
        />
        
        <PerformanceCard
          metrics={metrics}
          loading={loading}
        />
        
        <StatusCard
          trucks={trucks}
          onUpdateLocation={() => navigation.navigate('UpdateLocation')}
          onToggleAvailability={(available) => {
            if (trucks.length > 0) {
              const mainTruck = trucks[0];
              handleUpdateTruckAvailability(mainTruck, available);
            }
          }}
        />
        
        <TrucksList
          trucks={trucks}
          loading={loading || !!updatingTruck}
          onAddTruck={() => navigation.navigate('AddTruck')}
          onUpdateAvailability={(truck, newAvailability) => {
            handleUpdateTruckAvailability(truck, newAvailability);
          }}
          onViewSales={(truck) => navigation.navigate('TruckSales', { truck })}
          onManage={(truck) => navigation.navigate('TruckDetails', { truck })}
        />
        
        <RecentOrdersList
          orders={recentOrders}
          loading={loading}
          onViewAll={() => {
            // Navigate to a screen that shows all orders
            if (trucks.length > 0) {
              const mainTruck = trucks[0];
              navigation.navigate('TruckDetails', { 
                truck: mainTruck,
                initialTab: 'orders' // Pass a prop to initially show orders tab
              });
            }
          }}
        />
        
        <QuickActions
          onUpdateLocation={() => navigation.navigate('UpdateLocation')}
          onViewEarnings={() => navigation.navigate('Earnings')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    padding: 16,
  },
});