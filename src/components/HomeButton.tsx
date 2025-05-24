import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function HomeButton({ navigation, userRole }: any) {
  return (
    <TouchableOpacity
      style={styles.homeButton}
      onPress={() =>
        navigation.navigate(userRole === 'driver' ? 'DriverDashboard' : 'CustomerDashboard')
      }
    >
      <Text>Home</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 100,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
});