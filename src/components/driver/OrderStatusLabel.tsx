import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderStatusLabelProps {
  status: 'preparing' | 'ready' | 'completed' | 'new';
  compact?: boolean;
}

export const OrderStatusLabel = ({ status, compact = false }: OrderStatusLabelProps) => {
  let iconName, backgroundColor, textColor, statusText;
  
  switch (status.toLowerCase()) {
    case 'new':
      iconName = 'time-outline';
      backgroundColor = '#E3F2FD';
      textColor = '#1976D2';
      statusText = 'New';
      break;
    case 'preparing':
      iconName = 'flame-outline';
      backgroundColor = '#FFF8E1';
      textColor = '#FFA000';
      statusText = 'Preparing';
      break;
    case 'ready':
      iconName = 'checkmark-circle-outline';
      backgroundColor = '#E8F5E9';
      textColor = '#2E7D32';
      statusText = 'Ready';
      break;
    case 'completed':
      iconName = 'checkmark-done-outline';
      backgroundColor = '#ECEFF1';
      textColor = '#455A64';
      statusText = 'Completed';
      break;
    default:
      iconName = 'help-outline';
      backgroundColor = '#EEEEEE';
      textColor = '#757575';
      statusText = status;
  }
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor },
      compact && styles.compactContainer
    ]}>
      <Ionicons name={iconName} size={compact ? 14 : 16} color={textColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  compactContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  }
});