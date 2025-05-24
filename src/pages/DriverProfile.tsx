import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from '../api/appwrite'; // Adjust the import path if needed

export default function DriverProfile({ navigation }: any) {
  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (error) {
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Profile</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
  logoutButton: {
    backgroundColor: '#D8572A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});