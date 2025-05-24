import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { signUp, databases } from '../api/appwrite';
import { Query } from 'react-native-appwrite';
import { APPWRITE_DATABASE_ID, COLLECTION_USERS } from '../constants/databaseConstants';

export default function SignUp({ navigation, onSignUp }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSignUp = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Invalid Password', 'Password cannot be empty.');
      return;
    }
    if (!userName.trim()) {
      Alert.alert('Invalid Username', 'Username cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      // Check if username is already taken
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_USERS,
        [Query.equal('user_name', userName.trim())]
      );
      if (existing.total > 0) {
        Alert.alert('Username Taken', 'That username is already in use. Please choose another.');
        setLoading(false);
        return;
      }

      // Try to create the user in Appwrite Auth
      let user;
      try {
        user = await signUp(email, password);
      } catch (error: any) {
        // Appwrite will throw if the email is already registered
        let msg =
          error?.message ||
          error?.response?.message ||
          (Array.isArray(error?.response) && error.response[0]?.message) ||
          'Unknown error';
        if (
          msg.toLowerCase().includes('email') &&
          msg.toLowerCase().includes('already') &&
          msg.toLowerCase().includes('exists')
        ) {
          Alert.alert('Email Taken', 'That email is already registered. Please use another.');
        } else {
          Alert.alert('Sign Up Error', msg);
        }
        setLoading(false);
        return;
      }

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_USERS,
        user.$id,
        {
          id: user.$id,
          user_name: userName,
          role,
          created_at: new Date().toISOString(),
          email,
        }
      );

      Alert.alert('Sign up successful!');
      if (onSignUp) onSignUp();
      navigation.navigate('SignIn');
    } catch (error: any) {
      let msg =
        error?.message ||
        error?.response?.message ||
        (Array.isArray(error?.response) && error.response[0]?.message) ||
        'Unknown error';
      Alert.alert('Sign Up Error', msg);
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Sign Up</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginBottom: 8, borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 8, borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="User Name" value={userName} onChangeText={setUserName} style={{ marginBottom: 8, borderWidth: 1, padding: 8 }} />
      <Text style={{ marginBottom: 8 }}>Account Type:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: role === 'customer' ? '#cde' : '#eee',
            alignItems: 'center',
            borderRadius: 8,
            marginRight: 8,
          }}
          onPress={() => setRole('customer')}
        >
          <Text>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: role === 'driver' ? '#cde' : '#eee',
            alignItems: 'center',
            borderRadius: 8,
          }}
          onPress={() => setRole('driver')}
        >
          <Text>Driver</Text>
        </TouchableOpacity>
      </View>
      <Button title={loading ? "Signing Up..." : "Sign Up"} onPress={handleSignUp} disabled={loading} />
      <Button title="Back to Sign In" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
}