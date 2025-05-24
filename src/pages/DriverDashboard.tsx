import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { fetchTrucks, getCurrentUser, updateTruckAvailability } from '../api/appwrite';
import { Ionicons } from '@expo/vector-icons';

export default function DriverDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => setUserId(user.$id))
      .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchTrucks(userId)
      .then(setTrucks)
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleToggleAvailability = async (truck: any) => {
    await updateTruckAvailability(truck.id, !truck.available);
    setTrucks(trucks =>
      trucks.map(t => t.id === truck.id ? { ...t, available: !t.available } : t)
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
            onPress={() => navigation.navigate('OrdersScreen', { truck: item })}
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
      {/* Profile Icon in Top Right */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
        onPress={() => navigation.navigate('DriverProfile')}
      >
        <Ionicons name="person-circle-outline" size={38} color="#D8572A" />
      </TouchableOpacity>
      <Text style={styles.header}>WhatTheTruck</Text>
      <Text style={styles.sectionTitle}>Food Trucks</Text>
      <FlatList
        data={trucks}
        keyExtractor={item => item.id}
        renderItem={renderTruck}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No trucks found.</Text>}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  truckCard: {
    flexDirection: 'row',
    backgroundColor: '#2222', // light card for now
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
  manageDetailsButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  manageDetailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});