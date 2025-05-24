import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { fetchTrucks, addTruck, getCurrentUser, updateTruckAvailability } from '../api/appwrite';
import { CUISINE_OPTIONS } from '../constants/cuisines';

const CUISINE_EMOJIS: Record<string, string> = {
  mexican: '🌮',
  asian: '🍜',
  american: '🍔',
  italian: '🍝',
  dessert: '🧁',
  vegan: '🥗',
  bbq: '🍖',
  seafood: '🦐',
  sandwiches: '🥪',
};

export default function DriverDashboard({ navigation }: any) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [truckName, setTruckName] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const toggleCuisine = (cuisine: string) => {
    const lower = cuisine.toLowerCase();
    setSelectedCuisines(prev => {
      if (prev.map(c => c.toLowerCase()).includes(lower)) {
        return prev.filter(c => c.toLowerCase() !== lower);
      } else {
        return [...prev, cuisine];
      }
    });
  };

  const handleAddTruck = async () => {
    if (!truckName) {
      Alert.alert('Please enter a truck name.');
      return;
    }
    if (selectedCuisines.length === 0) {
      Alert.alert('Please select at least one cuisine.');
      return;
    }
    if (!userId) {
      Alert.alert('User not found.');
      return;
    }
    const result = await addTruck({
      truck_name: truckName,
      cuisines: selectedCuisines.map(c => c.toLowerCase()),
      driver_id: userId,
    });
    if (result) {
      Alert.alert('Success', 'Truck created successfully!');
      setTruckName('');
      setSelectedCuisines([]);
      setShowCreateForm(false);
      const updated = await fetchTrucks(userId);
      setTrucks(updated);
    } else {
      Alert.alert('Error', 'Failed to create truck.');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 16, marginTop: 32 }}>
      {!showCreateForm && (
        <Button title="Create Truck" onPress={() => setShowCreateForm(true)} />
      )}
      {showCreateForm && (
        <View>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>Add New Truck</Text>
          <TextInput
            placeholder="Truck Name"
            value={truckName}
            onChangeText={setTruckName}
            style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          />
          <Text style={{ marginBottom: 4 }}>Select Cuisines:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {CUISINE_OPTIONS.map(option => {
              const isSelected = selectedCuisines.map(c => c.toLowerCase()).includes(option.toLowerCase());
              const emoji = CUISINE_EMOJIS[option.toLowerCase()] || '';
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.cuisineButton,
                    isSelected && styles.cuisineButtonSelected
                  ]}
                  onPress={() => toggleCuisine(option)}
                >
                  <Text style={{ fontSize: 18, marginRight: 4 }}>{emoji}</Text>
                  <Text style={{ color: isSelected ? '#fff' : '#333' }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button title="Add Truck" onPress={handleAddTruck} />
          <Button title="Cancel" color="#888" onPress={() => setShowCreateForm(false)} />
        </View>
      )}
      <Text style={{ fontSize: 20, marginVertical: 16 }}>Your Trucks</Text>
      <FlatList
        data={trucks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('TruckDetails', { truck: item })}
            style={styles.truckListItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text>
                  {item.truck_name} ({Array.isArray(item.cuisines) ? item.cuisines.map((c: string) => {
                    const emoji = CUISINE_EMOJIS[c.toLowerCase()] || '';
                    return `${emoji} ${c.charAt(0).toUpperCase() + c.slice(1)}`;
                  }).join(', ') : ''})
                </Text>
              </View>
              <Switch
                value={!!item.available}
                onValueChange={async (value) => {
                  await updateTruckAvailability(item.id, value);
                  // Optionally update local state for instant feedback
                  setTrucks(trucks => trucks.map(t => t.id === item.id ? { ...t, available: value } : t));
                }}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cuisineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 4,
    backgroundColor: '#f4f4f4',
  },
  cuisineButtonSelected: {
    backgroundColor: '#F28C28',
    borderColor: '#F28C28',
  },
  truckListItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});