import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTrucks } from '../api/appwrite';

const CUISINE_FILTERS = [
  { name: 'Mexican', icon: '🌮' },
  { name: 'Asian', icon: '🍜' },
  { name: 'American', icon: '🍔' },
  { name: 'Italian', icon: '🍕' },
  { name: 'Dessert', icon: '🍩' },
  { name: 'BBQ', icon: '🍖' },
];

const NEARBY_TRUCKS = [
  { id: '1', name: 'Tasty Tacos', distance: '0.5 mi', icon: '🌮', rating: 4.5 },
  { id: '2', name: 'BBQ Express', distance: '0.5 mi', icon: '🍖', rating: 4.6 },
  { id: '3', name: 'Noodle Master', distance: '1.2 mi', icon: '🍜', rating: 4.9 },
];

export default function CustomerDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrucks()
      .then(setTrucks)
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredTrucks = trucks.filter(truck => {
    const matchesName = truck.truck_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine =
      selectedCuisine === '' ||
      (truck.cuisines &&
        Array.isArray(truck.cuisines) &&
        truck.cuisines.some((c: string) => c.toLowerCase() === selectedCuisine.toLowerCase()));
    return matchesName && matchesCuisine;
  });

  const renderFeatureButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.featureButton} onPress={onPress}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color="#4A89F3" />
      </View>
      <Text style={styles.featureText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F28C28" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by truck name, food type..."
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        {/* Cuisine Filter */}
        <FlatList
          data={CUISINE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cuisineButton,
                selectedCuisine === item.name ? styles.cuisineButtonActive : null,
              ]}
              onPress={() => setSelectedCuisine(selectedCuisine === item.name ? '' : item.name)}
            >
              <Text style={styles.cuisineIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.cuisineText,
                  selectedCuisine === item.name ? styles.cuisineTextActive : null,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.name}
          contentContainerStyle={styles.cuisineFilterContainer}
        />

        {/* Feature Buttons */}
        <View style={styles.featureButtonsRow}>
          {renderFeatureButton({
            icon: 'navigate-outline',
            title: 'Find Nearby',
            onPress: () => navigation.navigate('MapScreen'),
          })}
          {renderFeatureButton({
            icon: 'star-outline',
            title: 'Top Rated',
            onPress: () => console.log('Top rated pressed'),
          })}
        </View>

        {/* Nearby Trucks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Trucks</Text>
          <TouchableOpacity onPress={() => console.log('See all nearby trucks')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={NEARBY_TRUCKS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.truckCard}
              onPress={() => navigation.navigate('TruckDetails', { truckId: item.id })}
            >
              <View style={styles.truckIconContainer}>
                <Text style={styles.truckIcon}>{item.icon}</Text>
              </View>
              <View style={styles.truckInfo}>
                <Text style={styles.truckName}>{item.name}</Text>
                <View style={styles.truckMetaRow}>
                  <Ionicons name="location-outline" size={12} color="#888" />
                  <Text style={styles.truckDistance}>{item.distance} away</Text>
                  <Ionicons name="star" size={12} color="#F9AD44" style={{ marginLeft: 8 }} />
                  <Text style={styles.truckRating}>{item.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          style={styles.trucksList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEF',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 10, color: '#333' },
  cuisineFilterContainer: { paddingVertical: 8 },
  cuisineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F1F2',
    marginRight: 8,
  },
  cuisineButtonActive: { backgroundColor: '#FF6B6B' },
  cuisineIcon: { fontSize: 24, marginBottom: 4 },
  cuisineText: { color: '#555', fontSize: 12, fontWeight: '500' },
  cuisineTextActive: { color: '#FFF', fontWeight: '600' },
  featureButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  featureButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: { color: '#333', fontSize: 14, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  seeAllText: { color: '#F28C28', fontSize: 14 },
  truckCard: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10, elevation: 2 },
  truckIconContainer: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  truckIcon: { fontSize: 24 },
  truckInfo: { flex: 1 },
  truckName: { fontSize: 16, fontWeight: '600', color: '#333' },
  truckMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  truckDistance: { color: '#888', fontSize: 12, marginLeft: 4 },
  truckRating: { color: '#888', fontSize: 12, marginLeft: 4 },
});