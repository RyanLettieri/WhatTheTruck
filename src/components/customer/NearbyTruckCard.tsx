import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NearbyTruckCardProps {
  truck: any;
  onPress: () => void;
}

export const NearbyTruckCard = ({ truck, onPress }: NearbyTruckCardProps) => {
  // Format cuisines display - show up to 2 with '+more' indicator if needed
  const cuisines = Array.isArray(truck.cuisines) ? truck.cuisines : 
                  (truck.cuisine ? [truck.cuisine] : ['American']);
  
  let cuisineDisplay = '';
  if (cuisines.length === 0) {
    cuisineDisplay = 'American';
  } else if (cuisines.length === 1) {
    cuisineDisplay = cuisines[0];
  } else if (cuisines.length === 2) {
    cuisineDisplay = `${cuisines[0]}, ${cuisines[1]}`;
  } else {
    cuisineDisplay = `${cuisines[0]}, ${cuisines[1]} +${cuisines.length - 2} more`;
  }
  
  // Use first cuisine for the icon
  const primaryCuisine = cuisines[0] || 'American';
  const cuisineIcon = getCuisineEmoji(primaryCuisine);
  
  // Get rating with proper fallback
  const rating = truck.rating || truck.average_rating || '4.8';
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.cuisineIcon}>{cuisineIcon}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{truck.truck_name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{rating}</Text>
          <Text style={styles.bulletPoint}> • </Text>
          <Text style={styles.cuisineText} numberOfLines={1} ellipsizeMode="tail">
            {cuisineDisplay}
          </Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#777" />
          <Text style={styles.distance}>0.3 mi</Text>
          <Ionicons name="time-outline" size={14} color="#777" style={styles.timeIcon} />
          <Text style={styles.time}>15 min</Text>
        </View>
      </View>
      
      {truck.available ? (
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Open</Text>
        </View>
      ) : (
        <View style={[styles.statusBadge, styles.closedBadge]}>
          <View style={[styles.statusDot, styles.closedDot]} />
          <Text style={[styles.statusText, styles.closedText]}>Closed</Text>
        </View>
      )}
      
      <Ionicons 
        name="chevron-forward" 
        size={18} 
        color="#999" 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

// Helper function to get emoji based on cuisine (same as before)
const getCuisineEmoji = (cuisine: string) => {
  const cuisineMap: {[key: string]: string} = {
    'mexican': '🌮',
    'asian': '🍜',
    'american': '🍔',
    'italian': '🍕',
    'dessert': '🍩',
    'bbq': '🍖',
    'seafood': '🦞',
    'indian': '🍛',
    'breakfast': '🥞',
    'mediterranean': '🥙',
    'vegan': '🥗',
    'japanese': '🍱',
    'healthy': '🥗',
    'gluten-free': '🌾'
  };
  
  const lowerCuisine = cuisine.toLowerCase();
  return cuisineMap[lowerCuisine] || '🚚';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cuisineIcon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#555',
    marginLeft: 3,
    fontWeight: '500',
  },
  bulletPoint: {
    fontSize: 12,
    color: '#777',
  },
  cuisineText: {
    fontSize: 12,
    color: '#555',
    flex: 1, // Allow text to fill available space
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#777',
    marginLeft: 3,
  },
  timeIcon: {
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    color: '#777',
    marginLeft: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  closedBadge: {},
  closedDot: {
    backgroundColor: '#F44336',
  },
  closedText: {
    color: '#F44336',
  },
  chevron: {
    marginLeft: 5,
  }
});