import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DriverDashboard from '../pages/DriverDashboard';
import TruckDetails from '../pages/TruckDetails';
import ManageMenu from '../pages/ManageMenu';
import OrdersScreen from '../pages/OrdersScreen';
import ManageTruckDetails from '../pages/ManageTruckDetails';

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
      <Stack.Screen name="TruckDetails" component={TruckDetails} />
      <Stack.Screen name="ManageMenu" component={ManageMenu} />
      <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
      <Stack.Screen name="ManageTruckDetails" component={ManageTruckDetails} />
    </Stack.Navigator>
  );
}