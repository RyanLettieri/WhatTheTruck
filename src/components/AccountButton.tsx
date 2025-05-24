import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AccountButton({ navigation }: any) {
  return (
    <TouchableOpacity
      style={styles.accountButton}
      onPress={() => navigation.navigate('CustomerAccount')}
    >
      <Text>Account</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accountButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
});