import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchTrucks } from '../api/appwrite';
import { CUISINE_OPTIONS } from '../constants/cuisines';
import HomeButton from '../components/HomeButton';
import AccountButton from '../components/AccountButton';

const NEARBY_TRUCKS = [
  { id: '1', name: 'Tasty Tacos', distance: '0.5 mi', icon: '🚚' },
  { id: '2', name: 'BBQ Express', distance: '0.5 mi', icon: '🚚' },
];

const FAVORITES = [
  { id: '3', name: 'Pizza Wagon', icon: '🍕' },
  { id: '4', name: 'Curry in a Hurry', icon: '🍛' },
];

const PAST_ORDERS = [
  { id: '5', name: 'The Bun Bus', icon: '🚐' },
  { id: '6', name: 'Sushi Mobile', icon: '🚎' },
];

export default function CustomerDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrucks()
      .then(setTrucks)
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredTrucks = trucks.filter(truck => {
    const matchesName = truck.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      foodType === 'all' ||
      (truck.cuisines &&
        Array.isArray(truck.cuisines) &&
        truck.cuisines.map((c: string) => c.toLowerCase()).includes(foodType));
    return matchesName && matchesType;
  });

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by truck name..."
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('CustomerAccount')}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={CUISINE_OPTIONS}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              foodType === item && styles.filterButtonActive,
            ]}
            onPress={() => setFoodType(item)}
          >
            <Text>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
        style={{ marginVertical: 8 }}
      />
      <Text style={styles.sectionHeader}>Nearby Trucks</Text>
      <FlatList
        data={NEARBY_TRUCKS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.truckCard}>
            <Text style={styles.truckIcon}>{item.icon}</Text>
            <View>
              <Text style={styles.truckName}>{item.name}</Text>
              <Text style={styles.truckDistance}>{item.distance} away</Text>
            </View>
          </View>
        )}
      />
      <Text style={styles.sectionHeader}>Favorites</Text>
      <FlatList
        data={FAVORITES}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.favoriteCard}>
            <Text style={styles.favoriteIcon}>{item.icon}</Text>
            <Text style={styles.favoriteName}>{item.name}</Text>
          </View>
        )}
      />
      <Text style={styles.sectionHeader}>Past Orders</Text>
      <FlatList
        data={PAST_ORDERS}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.pastOrderCard}>
            <Text style={styles.pastOrderIcon}>{item.icon}</Text>
            <Text style={styles.pastOrderName}>{item.name}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('MapScreen')}>
        <Text style={styles.mapButtonText}>View Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFAF7', padding: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  settingsButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  filterButtonActive: {
    backgroundColor: '#cde',
    borderColor: '#88a',
  },
  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  truckIcon: { fontSize: 32, marginRight: 12 },
  truckName: { fontSize: 16, fontWeight: 'bold' },
  truckDistance: { color: '#888', fontSize: 14 },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 100,
  },
  favoriteIcon: { fontSize: 28 },
  favoriteName: { fontSize: 14, marginTop: 4 },
  pastOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 100,
  },
  pastOrderIcon: { fontSize: 28 },
  pastOrderName: { fontSize: 14, marginTop: 4 },
  mapButton: {
    backgroundColor: '#F28C28',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  mapButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});