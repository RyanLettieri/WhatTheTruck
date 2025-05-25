import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import DriverDashboard from '../pages/DriverDashboard';
import OrdersScreen from '../pages/OrdersScreen';
import MessagesScreen from '../pages/MessagesScreen';
import DriverProfile from '../pages/DriverProfile';
import TruckDetails from '../pages/TruckDetails';
// import ManageMenu from '../pages/ManageMenu';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Dashboard tab (includes nested screens)
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
      <Stack.Screen name="TruckDetails" component={TruckDetails} />
      {/* <Stack.Screen name="ManageMenu" component={ManageMenu} /> */}
      {/* <Stack.Screen name="TruckDetails" component={TruckDetails} /> */}
    </Stack.Navigator>
  );
}

// Stack navigator for Orders tab (if you need nested screens)
function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      {/* Add other order-related screens here if needed */}
    </Stack.Navigator>
  );
}

// Stack navigator for Messages tab (if you need nested screens)
function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesList" component={MessagesScreen} />
      {/* Add other message-related screens here if needed */}
    </Stack.Navigator>
  );
}

// Stack navigator for Profile tab (if you need nested screens)
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={DriverProfile} />
      {/* Add other profile-related screens here if needed */}
    </Stack.Navigator>
  );
}

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
          if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F28C28',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesStack}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}