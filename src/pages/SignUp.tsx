import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signUp, signIn, databases, account } from '../api/appwrite';
import { Query } from 'react-native-appwrite';
import { APPWRITE_DATABASE_ID, COLLECTION_USERS } from '../constants/databaseConstants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SignUp({ navigation, onSignUp }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSignUp = async () => {
    if (!email || !password || !userName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    
    try {
      // Check if username is already taken
      try {
        const existingUsers = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_USERS,
          [Query.equal('user_name', userName)]
        );
        
        if (existingUsers.total > 0) {
          Alert.alert('Username Taken', 'This username is already in use. Please choose another.');
          setLoading(false);
          return;
        }
      } catch (queryError: any) {
        console.log('Username check failed:', queryError);
      }

      // Check if email is already in use
      try {
        const existingEmails = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_USERS,
          [Query.equal('email', email.toLowerCase())]
        );
        
        if (existingEmails.total > 0) {
          Alert.alert(
            'Email Already Registered', 
            'An account with this email already exists.',
            [
              { text: 'Sign In Instead', onPress: () => navigation.navigate('SignIn') },
              { text: 'OK', style: 'cancel' }
            ]
          );
          setLoading(false);
          return;
        }
      } catch (emailQueryError: any) {
        console.log('Email check failed:', emailQueryError);
      }

      // Create account
      const user = await signUp(email.toLowerCase(), password);
      
      try {
        const profileData = {
          id: user.$id,
          email: email.toLowerCase(),
          user_name: userName,
          role: role,
          created_at: new Date().toISOString(),
        };

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_USERS,
          user.$id,
          profileData
        );

        // Delete all sessions to ensure clean state
        try {
          const sessions = await account.listSessions();
          console.log(`Found ${sessions.sessions.length} active sessions after signup`);
          
          for (const session of sessions.sessions) {
            try {
              await account.deleteSession(session.$id);
              console.log(`Deleted session: ${session.$id}`);
            } catch (deleteError) {
              console.log(`Failed to delete session ${session.$id}:`, deleteError);
            }
          }
        } catch (listError) {
          console.log('Failed to list sessions:', listError);
          // Try to delete current session as fallback
          try {
            await account.deleteSession('current');
          } catch (e) {
            console.log('Failed to delete current session:', e);
          }
        }

        Alert.alert('Success!', 'Account created successfully! Please sign in.', [
          { text: 'OK', onPress: () => navigation.navigate('SignIn') }
        ]);
      } catch (profileError: any) {
        // Profile creation failed, but account exists
        console.error('Profile creation failed:', profileError);
        
        // Delete all sessions to ensure clean state
        try {
          const sessions = await account.listSessions();
          for (const session of sessions.sessions) {
            try {
              await account.deleteSession(session.$id);
            } catch (e) {
              console.log(`Failed to delete session during cleanup: ${session.$id}`);
            }
          }
        } catch (cleanupError) {
          // Try to delete current session as fallback
          try {
            await account.deleteSession('current');
          } catch (e) {
            console.log('Failed to delete current session during cleanup:', e);
          }
        }
        
        Alert.alert(
          'Account Created', 
          'Your account was created but profile setup failed. You can sign in and we\'ll help you complete your profile.',
          [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
        );
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Failed to create account';
      if (error?.code === 409 || error?.message?.includes('user_already_exists')) {
        errorMessage = 'An account with this email already exists.';
        Alert.alert(
          'Sign Up Error', 
          errorMessage,
          [
            { text: 'Sign In Instead', onPress: () => navigation.navigate('SignIn') },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Sign Up Error', error?.message || errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.container}>
            <Text style={styles.title}>WhatTheTruck</Text>
            <Text style={styles.subtitle}>Join the food truck revolution</Text>
            
            {/* Truck Image */}
            <Image 
              source={require('../../assets/truck-placeholder.png')} 
              style={styles.truckImage}
              onError={() => console.log('Image load error - using emoji instead')}
            />
            {/* Fallback emoji if image doesn't load */}
            <Text style={[styles.truckIcon, { display: 'none' }]}>🚚</Text>

            {/* Input Fields with improved handling */}
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={(text) => setEmail(text.trim().toLowerCase())}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#888"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={userName}
              onChangeText={(text) => setUserName(text.trim())}
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Role Selection - same as before */}
            <Text style={styles.roleLabel}>I want to...</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton, 
                  role === 'customer' ? styles.roleSelected : styles.roleUnselected
                ]}
                onPress={() => setRole('customer')}
              >
                <Ionicons 
                  name="restaurant-outline" 
                  size={20} 
                  color={role === 'customer' ? "#FF7E30" : "#666"} 
                  style={styles.roleIcon} 
                />
                <Text style={[
                  styles.roleText,
                  role === 'customer' && styles.roleTextSelected
                ]}>Order Food</Text>
                {role === 'customer' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={18} color="#FF7E30" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton, 
                  role === 'driver' ? styles.roleSelected : styles.roleUnselected
                ]}
                onPress={() => setRole('driver')}
              >
                <Ionicons 
                  name="car-outline" 
                  size={20} 
                  color={role === 'driver' ? "#FF7E30" : "#666"}
                  style={styles.roleIcon} 
                />
                <Text style={[
                  styles.roleText,
                  role === 'driver' && styles.roleTextSelected
                ]}>Sell Food</Text>
                {role === 'driver' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={18} color="#FF7E30" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Create Account Button with loading states */}
            <TouchableOpacity
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Checking availability...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} disabled={loading}>
              <Text style={[styles.signInLink, loading && { opacity: 0.5 }]}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FF7E30', // Orange background like in the image
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 28,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7E30', // Orange background
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#FFFFFF',
    marginBottom: 28,
    fontSize: 18,
    textAlign: 'center',
  },
  truckImage: {
    width: 100,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 28,
  },
  truckIcon: {
    fontSize: 56,
    marginBottom: 28,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 15,
    fontSize: 17,
    marginBottom: 14,
    color: '#333',
  },
  roleLabel: {
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    position: 'relative', // For positioning the checkmark
  },
  roleSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FF7E30',
  },
  roleUnselected: {
    backgroundColor: '#FFEBDA',
    borderWidth: 1,
    borderColor: 'rgba(255,126,48,0.2)',
  },
  roleIcon: {
    marginRight: 8,
  },
  roleText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#666',
  },
  roleTextSelected: {
    color: '#FF7E30',
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
  },
  createButton: {
    width: '100%',
    backgroundColor: '#2E1A12', // Dark brown
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#4A2A1A', // Slightly lighter brown when disabled
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signInLink: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});