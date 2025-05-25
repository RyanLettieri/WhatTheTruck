import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { fetchTrucks, getCurrentUser, updateTruckAvailability, fetchProfileById } from '../api/appwrite';
import { Ionicons } from '@expo/vector-icons';

export default function DriverDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        setUserId(user.$id);
        // Fetch the user profile for additional information
        const profile = await fetchProfileById(user.$id);
        setUserProfile(profile);
      })
      .catch(() => {
        setUserId(null);
        setUserProfile(null);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchTrucks(userId)
      .then(setTrucks)
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  }, [userId]);

  // Refresh trucks when navigating back from AddTruck
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        fetchTrucks(userId)
          .then(setTrucks)
          .catch(() => setTrucks([]));
      }
    });
    return unsubscribe;
  }, [navigation, userId]);

  const handleToggleAvailability = async (truck: any) => {
    await updateTruckAvailability(truck.$id || truck.id, !truck.available);
    setTrucks(trucks =>
      trucks.map(t => (t.$id || t.id) === (truck.$id || truck.id) ? { ...t, available: !t.available } : t)
    );
  };

  const renderTruck = ({ item }: { item: any }) => (
    <View style={styles.truckCard}>
      <Image
        source={item.image_url ? { uri: item.image_url } : require('../../assets/truck-placeholder.png')}
        style={styles.truckImage}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.truckName}>{item.truck_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.available ? '#3DD598' : '#888' }]}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
              {item.available ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        <Text style={styles.truckAddress}>{item.address || 'No address set'}</Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleAvailability(item)}
          >
            <Text style={styles.actionButtonText}>Update Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { marginLeft: 8 }]}
            onPress={() => navigation.navigate('Orders', { 
              screen: 'OrdersList', 
              params: { truck: item } 
            })}
          >
            <Text style={styles.actionButtonText}>View Sales</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 8, width: '100%' }]}
          onPress={() => navigation.navigate('TruckDetails', { truck: item })}
        >
          <Text style={styles.actionButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, paddingTop: 32, backgroundColor: '#faf8f3' }}>
      <Text style={styles.header}>WhatTheTruck</Text>
      
      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>Food Trucks</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTruck')}
        >
          <Ionicons name="add-circle" size={24} color="#FF6B6B" />
          <Text style={styles.addButtonText}>Add Truck</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trucks}
        keyExtractor={item => item.$id || item.id}
        renderItem={renderTruck}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#ccc" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No trucks found.</Text>
            <Text style={styles.emptySubtext}>Add your first food truck to get started!</Text>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('AddTruck')}
            >
              <Text style={styles.emptyAddButtonText}>Add Your First Truck</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 4,
  },
  truckCard: {
    flexDirection: 'row',
    backgroundColor: '#2222',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  truckImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  truckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  truckAddress: {
    color: '#ccc',
    marginTop: 2,
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  actionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});