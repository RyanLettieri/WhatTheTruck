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
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTrucks, fetchUserFavorites, removeFavorite, getCurrentUser } from '../api/appwrite';
import { FavoriteTruckCard } from '../components/FavoriteTruckCard';

const CUISINE_FILTERS = [
  { name: 'Mexican', icon: '🌮' },
  { name: 'Asian', icon: '🍜' },
  { name: 'American', icon: '🍔' },
  { name: 'Italian', icon: '🍕' },
  { name: 'Dessert', icon: '🍩' },
  { name: 'BBQ', icon: '🍖' },
];

export default function CustomerDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const REFRESH_COOLDOWN = 30000; // 30 seconds between refreshes

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.$id);
        
        // Load favorites
        const userFavorites = await fetchUserFavorites(user.$id);
        setFavorites(userFavorites);
      }
      
      // Load all trucks
      const allTrucks = await fetchTrucks();
      setTrucks(allTrucks);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (truckId: string) => {
    if (!userId) return;
    
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this truck from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeFavorite(userId, truckId);
            if (success) {
              setFavorites(favorites.filter(fav => fav.truck_id !== truckId));
            } else {
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  };

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
      await loadData(); // Your existing data loading function
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

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

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#F28C28"]}
            tintColor="#F28C28"
          />
        }
      >
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

        {/* Your Favorites Section */}
        {favorites.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Favorites</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={favorites.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.$id}
              renderItem={({ item }) => (
                <FavoriteTruckCard
                  truck={item.truck}
                  onPress={() => navigation.navigate('CustomerTruckDetails', { truck: item.truck })}
                  onRemoveFavorite={() => handleRemoveFavorite(item.truck_id)}
                />
              )
              }
              style={styles.favoritesContainer}
            />
          </>
        )}

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
          <TouchableOpacity onPress={() => navigation.navigate('MapScreen')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTrucks.slice(0, 3)} // Show top 3 filtered trucks
          scrollEnabled={false}
          keyExtractor={item => item.$id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.truckCard}
              onPress={() => navigation.navigate('CustomerTruckDetails', { truck: item })}
            >
              <View style={styles.truckIconContainer}>
                <Text style={styles.truckIcon}>
                  {item.cuisines && item.cuisines.length > 0 
                    ? getCuisineEmoji(item.cuisines[0]) 
                    : '🚚'}
                </Text>
              </View>
              <View style={styles.truckInfo}>
                <Text style={styles.truckName}>{item.truck_name}</Text>
                <View style={styles.truckMetaRow}>
                  <Ionicons name="location-outline" size={12} color="#888" />
                  <Text style={styles.truckDistance}>Near you</Text>
                  <View style={[
                    styles.statusDot, 
                    item.available ? styles.available : styles.unavailable
                  ]} />
                  <Text style={styles.statusText}>
                    {item.available ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          style={styles.trucksList}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No trucks found</Text>
          }
        />
      </ScrollView>
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
  trucksList: { marginBottom: 20 },
  favoritesContainer: {
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    paddingVertical: 20,
  }
});