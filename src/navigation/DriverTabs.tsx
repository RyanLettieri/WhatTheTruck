import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverDashboard from '../pages/DriverDashboard';
import OrdersScreen from '../pages/OrdersScreen';
import MessagesScreen from '../pages/MessagesScreen';
import DriverProfile from '../pages/DriverProfile';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home-outline';
          if (route.name === 'Dashboard') iconName = 'home-outline';
          if (route.name === 'Orders') iconName = 'list-outline';
          if (route.name === 'Messages') iconName = 'chatbubble-ellipses-outline';
          if (route.name === 'DriverProfile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F28C28',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen name="Dashboard" component={DriverDashboard} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="DriverProfile" component={DriverProfile} />
    </Tab.Navigator>
  );
}