import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { signIn, fetchProfileById, getCurrentUser, databases } from '../api/appwrite';
import { Query } from 'react-native-appwrite';
import { APPWRITE_DATABASE_ID, COLLECTION_USERS } from '../constants/databaseConstants';

export default function SignIn({ navigation }: any) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (input: string) => /\S+@\S+\.\S+/.test(input);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      let emailToUse = emailOrUsername;
      if (!isValidEmail(emailOrUsername)) {
        const res = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_USERS,
          [Query.equal('user_name', emailOrUsername.trim())]
        );
        if (res.total === 0) {
          Alert.alert('Sign In Error', 'Username not found.');
          setLoading(false);
          return;
        }
        emailToUse = res.documents[0].email;
        if (!emailToUse) {
          Alert.alert('Sign In Error', 'No email found for this username.');
          setLoading(false);
          return;
        }
      }
      await signIn(emailToUse, password);
      const user = await getCurrentUser();
      if (!user || !user.$id) {
        Alert.alert('Sign In Error', 'Could not retrieve user information after sign in.');
        setLoading(false);
        return;
      }
      const profile = await fetchProfileById(user.$id);
      if (profile?.role === 'driver') {
        navigation.reset({ index: 0, routes: [{ name: 'DriverDashboard' }] });
      } else if (profile?.role === 'customer') {
        navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
      } else {
        Alert.alert('Profile missing role', 'Could not determine user role.');
      }
    } catch (error: any) {
      Alert.alert('Sign In Error', error?.message || error?.response?.message || 'Unknown error');
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../../assets/background-image.png')} // Replace with your image path
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={{ position: 'absolute', top: 20, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={styles.logo}>WhatTheTruck</Text>
          </View>
          <View style={{ flex: 1 }} />
          {/* <View style={{ position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}></View> */}
          <View style={styles.inputsContainer}>
            <TextInput
              placeholder="Email/username"
              placeholderTextColor="#B85C38"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              style={styles.input}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#B85C38"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => Alert.alert('Forgot password?', 'Password reset coming soon!')}
              style={{ alignSelf: 'flex-end', marginBottom: 8 }}
            >
                <Text style={[styles.forgotText, { color: '#fff', fontSize: 16 }]}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  illustration: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    opacity: 0.8,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 60,
    textAlign: 'center',
  },
  truckImage: {
    width: 160,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  inputsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFF6E9',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    color: '#B85C38',
    borderWidth: 0,
    width: '100%', // Add this line
  },
  forgotText: {
    color: '#B85C38',
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 8,
  },
  signInButton: {
    backgroundColor: '#D8572A',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 80,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});