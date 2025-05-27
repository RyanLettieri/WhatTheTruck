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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTrucks, fetchUserFavorites, removeFavorite, getCurrentUser } from '../api/appwrite';

// Import the new components
import { CategoryCard } from '../components/customer/CategoryCard';
import { FavoriteTruckCard } from '../components/customer/FavoriteTruckCard';
import { NearbyTruckCard } from '../components/customer/NearbyTruckCard';
import { QuickAccessButton } from '../components/customer/QuickAccessButton';

const CATEGORIES = [
  { name: 'Mexican', icon: '🌮' },
  { name: 'Asian', icon: '🍜' },
  { name: 'American', icon: '🍔' },
  { name: 'Italian', icon: '🍕' },
  { name: 'Dessert', icon: '🍩' },
  { name: 'Healthy', icon: '🥗' },
];

export default function CustomerDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const REFRESH_COOLDOWN = 30000; // 30 seconds between refreshes

  useEffect(() => {
    loadData();
  }, []);

  // Enhanced loadData function to better process truck data
  const loadData = async () => {
    try {
      // Get current user
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.$id);
        setUserData(user);
        
        // Load favorites
        const userFavorites = await fetchUserFavorites(user.$id);
        
        // If we have favorites, ensure each favorite has associated truck data
        if (userFavorites && userFavorites.length > 0) {
          // Process favorites to ensure they have proper truck data
          const processedFavorites = userFavorites.map(fav => {
            // If truck object is missing or incomplete, try to find the truck in allTrucks
            if (!fav.truck || !fav.truck.truck_name) {
              const truckId = fav.truck_id;
              const matchingTruck = trucks.find(t => (t.$id || t.id) === truckId);
              
              if (matchingTruck) {
                return {
                  ...fav,
                  truck: matchingTruck
                };
              }
            }
            return fav;
          });
          
          setFavorites(processedFavorites);
        } else {
          setFavorites(userFavorites || []);
        }
      }
      
      // Load all trucks
      const allTrucks = await fetchTrucks();
      
      // Process trucks to ensure consistent data format
      const processedTrucks = allTrucks.map(truck => ({
        ...truck,
        cuisines: truck.cuisines || (truck.cuisine ? [truck.cuisine] : ['American']),
        rating: truck.rating || truck.average_rating || '4.2',
        rating_count: truck.rating_count || truck.ratings_count || 0,
      }));
      
      setTrucks(processedTrucks);
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
    const matchesCategory =
      selectedCategory === '' ||
      (truck.cuisines &&
        Array.isArray(truck.cuisines) &&
        truck.cuisines.some((c: string) => c.toLowerCase() === selectedCategory.toLowerCase()));
    return matchesName && matchesCategory;
  });

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
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  const userName = userData?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
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
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey {userName}! 👋</Text>
            <Text style={styles.subGreeting}>What sounds good today?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#333" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>1</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle" size={28} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

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
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Filters')}>
            <Ionicons name="options-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <CategoryCard
                name={item.name}
                icon={item.icon}
                isSelected={selectedCategory === item.name}
                onPress={() => setSelectedCategory(selectedCategory === item.name ? '' : item.name)}
              />
            )}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Your Favorites Section */}
        {favorites.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Favorites</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={favorites.slice(0, 2)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => {
                // Ensure we have the truck data properly extracted
                const truckData = item.truck || item;
                
                // If it's a favorite relationship, make sure we have the right truck ID
                const truckId = item.truck_id || truckData.$id || truckData.id;
                
                // For debugging - remove in production
                console.log("Favorite truck data:", truckData);
                
                return (
                  <FavoriteTruckCard
                    truck={{
                      ...truckData,
                      // Ensure we have the truck name
                      truck_name: truckData.truck_name || truckData.name,
                      // Use the actual cuisines array or create a fallback
                      cuisines: truckData.cuisines || [truckData.cuisine || 'American'],
                      // Use the actual rating or fallback
                      rating: truckData.rating || truckData.average_rating || '4.2',
                      // Include promotion if it exists
                      promotion: truckData.promotion || "Free fries with any burger!"
                    }}
                    onPress={() => navigation.navigate('CustomerTruckDetails', { truck: truckData })}
                    onRemoveFavorite={() => handleRemoveFavorite(truckId)}
                  />
                );
              }}
              contentContainerStyle={styles.favoritesContainer}
            />
          </View>
        )}

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessContainer}>
          <QuickAccessButton
            icon="navigate-outline"
            title="Find Nearby"
            subtitle="Discover trucks around you"
            backgroundColor="#E9F5FF"
            iconBgColor="#B6DDFF"
            iconColor="#0066CC"
            onPress={() => navigation.navigate('MapScreen')}
          />
          <QuickAccessButton
            icon="star-outline"
            title="Top Rated"
            subtitle="Highest rated in your area"
            backgroundColor="#FFF5E5"
            iconBgColor="#FFEAD0"
            iconColor="#FF8C00"
            onPress={() => navigation.navigate('TopRatedTrucks')}
          />
        </View>

        {/* Nearby Trucks Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Trucks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MapScreen')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {filteredTrucks.length > 0 ? (
            filteredTrucks.slice(0, 3).map((truck) => {
              // For debugging - remove in production
              console.log("Nearby truck data:", truck);
              
              return (
                <NearbyTruckCard
                  key={truck.$id || truck.id}
                  truck={{
                    ...truck,
                    // Ensure proper rating and cuisines access
                    rating: truck.rating || truck.average_rating || '4.2',
                    rating_count: truck.rating_count || truck.ratings_count || 324,
                    cuisines: truck.cuisines || [truck.cuisine || 'American'],
                  }}
                  onPress={() => navigation.navigate('CustomerTruckDetails', { truck })}
                />
              );
            })
          ) : (
            <Text style={styles.emptyListText}>No trucks found nearby</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F9F9F9' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEF',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    paddingVertical: 12, 
    color: '#333' 
  },
  filterButton: {
    padding: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333' 
  },
  seeAllText: { 
    color: '#FF6B6B', 
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: { 
    paddingVertical: 8 
  },
  favoritesContainer: {
    paddingTop: 5,
    paddingBottom: 8,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    paddingVertical: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeNavButton: {
    borderTopWidth: 0,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  activeNavText: {
    color: '#FF6B6B',
    fontWeight: '500',
  }
});