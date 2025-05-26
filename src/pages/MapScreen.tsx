import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { fetchTrucks } from '../api/appwrite';

export default function MapScreen({ navigation }: any) {
  const [location, setLocation] = useState<any>(null);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        // Get user's current location
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Load trucks data
        const trucksData = await fetchTrucks();
        setTrucks(trucksData);
      } catch (error) {
        console.error('Error:', error);
        setErrorMsg('Failed to load map data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const getNearbyTrucks = () => {
    if (!location) return [];
    
    return trucks
      .filter(truck => truck.latitude && truck.longitude)
      .map(truck => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          parseFloat(truck.latitude),
          parseFloat(truck.longitude)
        );
        
        return {
          ...truck,
          distance
        };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  const nearbyTrucks = getNearbyTrucks();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="location" size={50} color="#F28C28" />
          <Text style={styles.loadingText}>Finding food trucks near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="#F28C28" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.replace('MapScreen')}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Food Trucks</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Food Trucks Near You</Text>
        <View style={styles.currentLocationBadge}>
          <Ionicons name="location" size={14} color="#fff" />
          <Text style={styles.currentLocationText}>Your Current Location</Text>
        </View>
      </View>

      {/* Trucks List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {nearbyTrucks.length > 0 
            ? `${nearbyTrucks.length} Trucks Found Nearby` 
            : 'No trucks found nearby'}
        </Text>
        
        <ScrollView style={styles.trucksList} showsVerticalScrollIndicator={false}>
          {nearbyTrucks.map((truck) => (
            <TouchableOpacity
              key={truck.id}
              style={styles.truckItem}
              onPress={() => navigation.navigate('TruckDetails', { truck })}
            >
              <View style={styles.truckIcon}>
                <Text style={styles.truckIconText}>
                  {truck.cuisines && truck.cuisines.length > 0 
                    ? getCuisineEmoji(truck.cuisines[0]) 
                    : '🚚'}
                </Text>
              </View>
              
              <View style={styles.truckInfo}>
                <Text style={styles.truckName}>{truck.truck_name}</Text>
                <View style={styles.truckMetaRow}>
                  <Ionicons name="location-outline" size={12} color="#888" />
                  <Text style={styles.truckDistance}>{formatDistance(truck.distance)} away</Text>
                  <View style={[styles.statusDot, truck.available ? styles.available : styles.unavailable]} />
                  <Text style={styles.statusText}>
                    {truck.available ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Helper function to get emoji based on cuisine
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#FFE8D6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currentLocationBadge: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#F28C28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  currentLocationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  trucksList: {
    flex: 1,
  },
  truckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  truckIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  truckIconText: {
    fontSize: 20,
  },
  truckInfo: {
    flex: 1,
  },
  truckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  truckMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckDistance: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#F28C28',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});