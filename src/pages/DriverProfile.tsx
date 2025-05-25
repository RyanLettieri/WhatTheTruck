import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../api/appwrite';

export default function DriverProfile({ navigation }: any) {
  // Settings state
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  // Mock user data - replace with actual user data
  const userData = {
    name: 'John Driver',
    email: 'john.driver@example.com',
    phone: '(555) 123-4567',
    profilePicture: null, // You can add actual image URI here
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
            } catch (error) {
              Alert.alert('Logout Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile feature coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Change password feature coming soon!');
  };

  const handleFAQs = () => {
    Alert.alert('FAQs', 'Frequently Asked Questions coming soon!');
  };

  const handleReportIssue = () => {
    Alert.alert('Report Issue', 'Report issue feature coming soon!');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Contact support feature coming soon!');
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Rate app feature coming soon!');
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    onPress: () => void,
    showArrow = true,
    textColor = '#333'
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={20} color="#666" />
        <Text style={[styles.menuItemText, { color: textColor }]}>{title}</Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={16} color="#999" />}
    </TouchableOpacity>
  );

  const renderToggleItem = (
    icon: string,
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={20} color="#666" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#F28C28' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Driver Info Section */}
      {renderSection('Driver Info', (
        <View>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {userData.profilePicture ? (
                <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#999" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData.name}</Text>
              <Text style={styles.profileEmail}>{userData.email}</Text>
              <Text style={styles.profilePhone}>{userData.phone}</Text>
            </View>
          </View>
          {renderMenuItem('create-outline', 'Edit Profile', handleEditProfile)}
        </View>
      ))}

      {/* Notifications & Settings Section */}
      {renderSection('Notifications & Settings', (
        <View>
          {renderToggleItem(
            'checkmark-circle-outline',
            'Accepting Orders',
            acceptingOrders,
            setAcceptingOrders
          )}
          {renderToggleItem(
            'notifications-outline',
            'Push Notifications',
            pushNotifications,
            setPushNotifications
          )}
          {renderToggleItem(
            'location-outline',
            'Location Sharing',
            locationSharing,
            setLocationSharing
          )}
          {renderMenuItem('settings-outline', 'App Settings', () => Alert.alert('App Settings', 'Coming soon!'))}
        </View>
      ))}

      {/* Account Actions Section */}
      {renderSection('Account Actions', (
        <View>
          {renderMenuItem('key-outline', 'Change Password', handleChangePassword)}
          {renderMenuItem('log-out-outline', 'Log Out', handleLogout, false, '#D8572A')}
        </View>
      ))}

      {/* Help & Feedback Section */}
      {renderSection('Help & Feedback', (
        <View>
          {renderMenuItem('help-circle-outline', 'FAQs', handleFAQs)}
          {renderMenuItem('bug-outline', 'Report an Issue', handleReportIssue)}
          {renderMenuItem('mail-outline', 'Contact Support', handleContactSupport)}
          {renderMenuItem('star-outline', 'Rate the App', handleRateApp)}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 16,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});