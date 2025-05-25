import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getCurrentUser, fetchProfileById } from './src/api/appwrite';
import { ActivityIndicator, View, Text, Image } from 'react-native';

import CustomerTabs from './src/navigation/CustomerTabs';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import DriverTabs from './src/navigation/DriverTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const account = await getCurrentUser();
      // Fetch profile by account.$id
      const profile = await fetchProfileById(account.$id);
      setUser({
        ...account,
        role: profile?.role, // assumes your profile doc has a 'role' field
      });
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        {/* Optional: Add your app logo */}
        <Image
          source={require('./assets/logo.png')} // Replace with your logo path
          style={{ width: 120, height: 120, marginBottom: 24 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#F28C28" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#F28C28' }}>
          Loading WhatTheTruck...
        </Text>
      </View>
    );
  }

  // Decide initial route based on user role
  let initialRoute = "SignIn";
  if (user) {
    if (user.role === "driver") {
      initialRoute = "DriverTabs";
    } else {
      initialRoute = "CustomerTabs"; // Changed from "CustomerDashboard"
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
        <Stack.Screen name="DriverTabs" component={DriverTabs} />
        {/* Remove CustomerDashboard, CustomerAccount, MapScreen from root stack */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}