import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { signIn, fetchProfileById, getCurrentUser, databases } from '../api/appwrite';
import { Query } from 'react-native-appwrite';
import { APPWRITE_DATABASE_ID, COLLECTION_USERS } from '../constants/databaseConstants';

export default function SignIn({ navigation }: any) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const isValidEmail = (input: string) => /\S+@\S+\.\S+/.test(input);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      let emailToUse = emailOrUsername;
      console.log('emailToUse:', emailToUse); // <-- Add this log

      // If not an email, treat as username and look up the email
      if (!isValidEmail(emailOrUsername)) {
        // Query your users collection for the username
        const res = await databases.listDocuments(
          APPWRITE_DATABASE_ID, // your database ID
          COLLECTION_USERS,                // your collection ID
          [Query.equal('user_name', emailOrUsername.trim())]
        );
        if (res.total === 0) {
          Alert.alert('Sign In Error', 'Username not found.');
          setLoading(false);
          return;
        }
        // You must have stored the email in the user document at sign-up
        emailToUse = res.documents[0].email;
        if (!emailToUse) {
          Alert.alert('Sign In Error', 'No email found for this username.');
          setLoading(false);
          return;
        }
      }

      console.log('emailToUse2:', emailToUse); // <-- Add this log
      await signIn(emailToUse, password);
      const user = await getCurrentUser();
      console.log('getCurrentUser result:', user); // <-- Add this log
      console.log('About to fetch profile for userId:', user.$id, typeof user.$id);

      if (!user || !user.$id) {
        Alert.alert('Sign In Error', 'Could not retrieve user information after sign in.');
        setLoading(false);
        return;
      }

      console.log('Fetching profile for userId:', user.$id); // <-- Add this log
      const profile = await fetchProfileById(user.$id);
      console.log('Fetched profile:', profile); // <-- Add this log

      if (profile?.role === 'driver') {
        navigation.reset({ index: 0, routes: [{ name: 'DriverDashboard' }] });
      } else if (profile?.role === 'customer') {
        navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
      } else {
        Alert.alert('Profile missing role', 'Could not determine user role.');
      }
    } catch (error: any) {
      console.log('Sign In Error details:', error); // <-- Add this log
      Alert.alert('Sign In Error', error?.message || error?.response?.message || 'Unknown error');
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Sign In</Text>
      <TextInput
        placeholder="Email or Username"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
        style={{ marginBottom: 8, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 8, borderWidth: 1, padding: 8 }}
      />
      <Button title={loading ? "Signing In..." : "Sign In"} onPress={handleSignIn} disabled={loading} />
      <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
}