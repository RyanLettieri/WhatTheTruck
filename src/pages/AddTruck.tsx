import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Temporarily comment out image picker
// import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, fetchProfileById, addTruck } from '../api/appwrite';
import { CUISINE_OPTIONS } from '../constants/cuisines';

export default function AddTruck({ navigation }) {
  // Form data
  const [truckName, setTruckName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [truckImage, setTruckImage] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cuisineDropdownVisible, setCuisineDropdownVisible] = useState(false);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await fetchProfileById(user.$id);
          if (profile) {
            // Auto-populate fields from user profile
            setEmail(profile.email || '');
            setPhone(profile.phone_number || '');
            setOwnerName(profile.user_name || '');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Temporarily disable image picker
  const pickImage = async () => {
    Alert.alert(
      'Coming Soon', 
      'Image upload functionality will be available in the next update.'
    );
  };

  const handleCuisineSelect = (cuisine: string) => {
    if (cuisineTypes.includes(cuisine)) {
      setCuisineTypes(cuisineTypes.filter(c => c !== cuisine));
    } else if (cuisineTypes.length < 3) {
      setCuisineTypes([...cuisineTypes, cuisine]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 3 cuisine types.');
    }
  };

  const validateForm = () => {
    if (!truckName.trim()) {
      Alert.alert('Missing Information', 'Please enter your food truck name.');
      return false;
    }

    if (cuisineTypes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one cuisine type.');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a brief description of your food truck.');
      return false;
    }

    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add a food truck.');
        setSubmitting(false);
        return;
      }

      await addTruck({
        truck_name: truckName,
        cuisines: cuisineTypes,
        driver_id: user.$id,
        description: description,
        license_number: licenseNumber,
      });

      Alert.alert(
        'Success!',
        'Your food truck has been registered successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error adding truck:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to register your food truck. Please try again.';
      
      if (error?.message?.includes('Missing required attribute')) {
        errorMessage = 'There was a problem with the form data. Please check all fields and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add Food Truck</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.truckIconContainer}>
            <Ionicons name="fast-food" size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Register Your Food Truck</Text>
          <Text style={styles.headerSubtitle}>Get started on our platform in minutes!</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Truck Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Truck Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Tony's Tacos"
              value={truckName}
              onChangeText={setTruckName}
              maxLength={50}
            />
          </View>

          {/* Owner Info - 2 column layout */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Owner Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="owner@foodtruck.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Make email non-editable since it's from the profile
            />
            {email ? (
              <Text style={styles.infoText}>Email from your profile will be used</Text>
            ) : null}
          </View>

          {/* Cuisine Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cuisine Type * (Select up to 3)</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setCuisineDropdownVisible(!cuisineDropdownVisible)}
            >
              <Text style={cuisineTypes.length === 0 ? styles.placeholderText : styles.dropdownButtonText}>
                {cuisineTypes.length === 0 ? 'Select your cuisine type' : cuisineTypes.join(', ')}
              </Text>
              <Ionicons 
                name={cuisineDropdownVisible ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {cuisineDropdownVisible && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {CUISINE_OPTIONS.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine}
                      style={styles.dropdownItem}
                      onPress={() => handleCuisineSelect(cuisine)}
                    >
                      <View style={styles.checkboxContainer}>
                        <View style={[
                          styles.checkbox,
                          cuisineTypes.includes(cuisine) && styles.checkboxChecked
                        ]}>
                          {cuisineTypes.includes(cuisine) && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>
                        <Text style={styles.dropdownItemText}>{cuisine}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brief Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about your food truck and what makes it special..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              maxLength={300}
            />
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>

          {/* License Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business License/Permit Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your business license number"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>

          {/* Food Truck Photo - Temporarily Disabled */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Truck Photo</Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={pickImage}
            >
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera" size={24} color="#999" />
                <Text style={styles.uploadText}>Image upload coming soon</Text>
                <Text style={styles.uploadSubtext}>You can add photos after registration</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkboxWrapper}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, (!agreeToTerms || submitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!agreeToTerms || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Application</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#faf8f3',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf8f3',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  truckIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#777',
    fontSize: 12,
    marginTop: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  checkboxWrapper: {
    padding: 8,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    height: 160,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#666',
    marginTop: 8,
    fontSize: 16,
  },
  uploadSubtext: {
    color: '#999',
    marginTop: 4,
    fontSize: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  termsLink: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ffb5b5',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});