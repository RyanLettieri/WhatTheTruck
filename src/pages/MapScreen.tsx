import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function MapScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('CustomerDashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      {/* Map content can go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: {
    marginTop: 48,
    marginLeft: 16,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: { fontSize: 16 },
});
