import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Switch, Image, Alert, TouchableOpacity, FlatList } from 'react-native';
import { fetchTruckById, updateTruckAvailability, fetchMenuItemsByTruckId, fetchReviewsByTruckId } from '../api/appwrite';
import { Ionicons } from '@expo/vector-icons';

export default function TruckDetails({ route, navigation }: any) {
  const { truck } = route.params;
  const [truckData, setTruckData] = useState<any>(truck);
  const [loading, setLoading] = useState(!truck);
  const [updating, setUpdating] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  useEffect(() => {
    if (!truck) return;
    setLoading(true);
    fetchTruckById(truck.id)
      .then(setTruckData)
      .catch(() => setTruckData(null))
      .finally(() => setLoading(false));
    fetchMenuItemsByTruckId(truck.id).then(setMenuItems);
    fetchReviewsByTruckId(truck.id).then(setReviews);
  }, [truck]);

  const handleToggleAvailable = async (value: boolean) => {
    setUpdating(true);
    const updated = await updateTruckAvailability(truckData.id, value);
    if (updated) {
      setTruckData({ ...truckData, available: value });
    } else {
      Alert.alert('Error', 'Failed to update availability.');
    }
    setUpdating(false);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  if (loading) return <ActivityIndicator />;
  if (!truckData) return <Text>Truck not found.</Text>;

  // Header and non-review content as a component
  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{truckData.truck_name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DriverDashboard')}>
          <Ionicons name="person-circle-outline" size={32} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Map Placeholder */}
      <View style={{ marginHorizontal: 24, backgroundColor: '#eee', borderRadius: 12, padding: 16, alignItems: 'center' }}>
        <Ionicons name="map-outline" size={40} color="#bbb" />
        <Text style={{ marginTop: 8, color: '#888' }}>Map Placeholder</Text>
        <TouchableOpacity style={{ marginTop: 8, backgroundColor: '#fff', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#ddd' }}>
          <Text style={{ color: '#222' }}>Update Location</Text>
        </TouchableOpacity>
      </View>
      {/* Menu Section */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 24, marginTop: 24 }}>Menu</Text>
      <View style={{ marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 12, marginTop: 8, padding: 12 }}>
        {menuItems.length === 0 && <Text style={{ color: '#888' }}>No menu items yet.</Text>}
        {menuItems.map(item => (
          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image source={{ uri: item.image_url }} style={{ width: 40, height: 40, borderRadius: 8, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.emoji} {item.name} {item.available === false && <Text style={{ color: '#888', fontWeight: 'normal' }}>(Unavailable)</Text>}</Text>
              <Text style={{ color: '#444' }}>${item.price?.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={{ marginRight: 8 }}>
              <Ionicons name="pencil-outline" size={20} color="#888" />
            </TouchableOpacity>
            <Switch
              value={!!item.available}
              onValueChange={async (value) => {
                // Implement updateMenuItemAvailability in your API
                // await updateMenuItemAvailability(item.id, value);
                // setMenuItems(items => items.map(i => i.id === item.id ? { ...i, available: value } : i));
              }}
            />
          </View>
        ))}
        <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 4 }}>
          <Ionicons name="add-circle-outline" size={28} color="#bbb" />
        </TouchableOpacity>
      </View>
      {/* Availability & Stats */}
      <View style={{ marginHorizontal: 24, marginTop: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginRight: 12 }}>Availability</Text>
          <View style={{ backgroundColor: truckData.available ? '#d1f5d3' : '#f5d1d1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: truckData.available ? '#228B22' : '#B22222', fontWeight: 'bold' }}>
              {truckData.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          <Switch
            style={{ marginLeft: 16 }}
            value={!!truckData.available}
            onValueChange={handleToggleAvailable}
            disabled={updating}
          />
        </View>
        {/* Stats - replace with real data if available */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View>
            <Text style={{ color: '#888' }}>Orders</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>42</Text>
          </View>
          <View>
            <Text style={{ color: '#888' }}>Revenue</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>$560.75</Text>
          </View>
          <View>
            <Text style={{ color: '#888' }}>Most Popular Item</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Cheeseburger</Text>
          </View>
        </View>
      </View>
      {/* Reviews Header */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 24, marginTop: 24 }}>Reviews</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8, marginRight: 24 }}>
        <TouchableOpacity onPress={() => setSortBy('recent')}>
          <Text style={{ color: sortBy === 'recent' ? '#F28C28' : '#888', marginRight: 12 }}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortBy('rating')}>
          <Text style={{ color: sortBy === 'rating' ? '#F28C28' : '#888' }}>Rating</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#faf8f3' }}
      ListHeaderComponent={renderHeader}
      data={sortedReviews}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8 }}>
          <Image source={{ uri: item.avatar_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.user_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {[...Array(item.rating)].map((_, i) => (
                <Ionicons key={i} name="star" size={14} color="#F28C28" />
              ))}
            </View>
            <Text>{item.comment}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ color: '#888', marginHorizontal: 24, marginTop: 8 }}>No reviews yet.</Text>
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
}