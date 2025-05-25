import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image, 
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProfileById, updateProfileById, getCurrentUser, account } from '../api/appwrite';

export default function CustomerAccount({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  // Mock additional user data - replace with actual data
  const userData = {
    name: username || (user?.user_name ?? 'Customer Name'),
    email: email || (user?.email ?? 'customer@example.com'),
    phone: user?.phone_number || '(555) 123-4567', // Add phone to your database if needed
    profilePicture: user?.profilePicture || null, // You can add actual image URI here
  };

  useEffect(() => {
    getCurrentUser()
      .then(u => {
        setUser(u);
        setEmail(u.email);
        return fetchProfileById(u.$id);
      })
      .then(profile => {
        if (profile?.username) setUsername(profile.username);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await account.deleteSession('current');
              navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
            } catch (error) {
              Alert.alert('Sign Out Error', 'Failed to sign out.');
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

  const handleOrderHistory = () => {
    Alert.alert('Order History', 'Order history feature coming soon!');
  };

  const handlePaymentMethods = () => {
    Alert.alert('Payment Methods', 'Payment methods feature coming soon!');
  };

  const handleAddresses = () => {
    Alert.alert('Saved Addresses', 'Saved addresses feature coming soon!');
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCFAF7' }}>
        <ActivityIndicator size="large" color="#F28C28" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading account...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Customer Info Section */}
      {renderSection('Account Info', (
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

      {/* Order Management Section */}
      {renderSection('Orders & Preferences', (
        <View>
          {renderMenuItem('receipt-outline', 'Order History', handleOrderHistory)}
          {renderMenuItem('card-outline', 'Payment Methods', handlePaymentMethods)}
          {renderMenuItem('location-outline', 'Saved Addresses', handleAddresses)}
        </View>
      ))}

      {/* Notifications & Settings Section */}
      {renderSection('Notifications & Settings', (
        <View>
          {renderToggleItem(
            'notifications-outline',
            'Push Notifications',
            pushNotifications,
            setPushNotifications
          )}
          {renderToggleItem(
            'mail-outline',
            'Email Notifications',
            emailNotifications,
            setEmailNotifications
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
          {renderMenuItem('log-out-outline', 'Sign Out', handleSignOut, false, '#D8572A')}
        </View>
      ))}

      {/* Help & Support Section */}
      {renderSection('Help & Support', (
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
    backgroundColor: '#FCFAF7',
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