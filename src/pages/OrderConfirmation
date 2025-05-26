import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderConfirmation({ route, navigation }: any) {
  const { orderId, truck } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.message}>
          Your order has been received and is being prepared by {truck.truck_name}.
        </Text>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Order Number</Text>
          <Text style={styles.orderId}>{orderId}</Text>
        </View>
        
        <Image
          source={require('../../assets/preparing-food.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <Text style={styles.instructionText}>
          You'll receive a notification when your order is ready for pickup.
        </Text>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.navigate('TrackOrder', { orderId })}
        >
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('CustomerDashboard')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  orderLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F28C28',
    letterSpacing: 1,
  },
  image: {
    width: '80%',
    height: 180,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  trackButton: {
    backgroundColor: '#F28C28',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    borderWidth: 1,
    borderColor: '#F28C28',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#F28C28',
    fontSize: 16,
    fontWeight: '600',
  },
});