import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Switch, Image, Alert, TouchableOpacity } from 'react-native';
import { fetchTruckById, updateTruckAvailability } from '../api/appwrite';

export default function TruckDetails({ route, navigation }: any) {
  const { truck } = route.params;
  const [truckData, setTruckData] = useState<any>(truck);
  const [loading, setLoading] = useState(!truck);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!truck) return;
    fetchTruckById(truck.id)
      .then(setTruckData)
      .catch(() => setTruckData(null))
      .finally(() => setLoading(false));
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

  if (loading) return <ActivityIndicator />;
  if (!truckData) return <Text>Truck not found.</Text>;

  return (
    <View style={{ padding: 24 }}>
      <TouchableOpacity
        style={{ marginBottom: 16 }}
        onPress={() => navigation.navigate('DriverDashboard')}
      >
        <Text style={{ fontSize: 16 }}>← Back to Dashboard</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 24 }}>{truckData.truck_name}</Text>
      <Text style={{ marginTop: 8, color: 'teal' }}>
        {truckData.cuisines?.length ? truckData.cuisines.join(', ') : 'No cuisines set'}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Text>Available:</Text>
        <Switch
          value={!!truckData.available}
          onValueChange={handleToggleAvailable}
          disabled={updating}
        />
      </View>
      {truckData.menu_image_url ? (
        <Image
          source={{ uri: truckData.menu_image_url }}
          style={{ width: 200, height: 120, marginTop: 16, borderRadius: 8 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ marginTop: 16, color: '#888' }}>No menu image available.</Text>
      )}
    </View>
  );
}