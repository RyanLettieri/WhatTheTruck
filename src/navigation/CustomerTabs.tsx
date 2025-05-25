import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerDashboard from '../pages/CustomerDashboard';
import MapScreen from '../pages/MapScreen';
import CustomerAccount from '../pages/CustomerAccount';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Dashboard tab (includes nested screens)
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
    </Stack.Navigator>
  );
}

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home-outline';
          if (route.name === 'Dashboard') iconName = 'home-outline';
          if (route.name === 'Map') iconName = 'map-outline';
          if (route.name === 'Orders') iconName = 'list-outline';
          if (route.name === 'Account') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F28C28',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Orders" component={CustomerDashboard} />
      <Tab.Screen name="Account" component={CustomerAccount} />
    </Tab.Navigator>
  );
}