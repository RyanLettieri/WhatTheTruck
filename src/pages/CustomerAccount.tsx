import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { fetchProfileById, updateProfileById, getCurrentUser, account } from '../api/appwrite';

export default function CustomerAccount({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current Appwrite user
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

  const handleSave = async () => {
    if (!user?.$id) return;
    setLoading(true);
    await updateProfileById(user.$id, { username });
    setLoading(false);
    Alert.alert('Profile updated!');
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (error) {
      Alert.alert('Sign Out Error', 'Failed to sign out.');
    }
  };

  if (loading) return <View><Text>Loading...</Text></View>;

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Account Settings</Text>
      <Text>Email:</Text>
      <TextInput value={email} editable={false} style={{ marginBottom: 8, borderWidth: 1, padding: 8 }} />
      <Text>Username:</Text>
      <TextInput value={username} editable={false} onChangeText={setUsername} style={{ marginBottom: 8, borderWidth: 1, padding: 8 }} />
      <Button
        title="Back to Dashboard"
        onPress={() => navigation.navigate('CustomerDashboard')}
      />
      <View style={{ height: 16 }} />
      <Button
        title="Sign Out"
        color="#d9534f"
        onPress={handleSignOut}
      />
    </View>
  );
}