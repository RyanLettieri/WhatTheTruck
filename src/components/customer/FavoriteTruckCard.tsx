import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FavoriteTruckCardProps {
  truck: any;
  onPress: () => void;
  onRemoveFavorite: () => void;
}

export const FavoriteTruckCard = ({ truck, onPress, onRemoveFavorite }: FavoriteTruckCardProps) => {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32; // Full width minus padding
  
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
    <View style={[styles.container, { width: cardWidth }]}>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.iconContainer}>
          <Text style={styles.cuisineIcon}>{cuisineIcon}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{truck.truck_name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.cuisineText}>• {cuisineDisplay}</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#777" />
            <Text style={styles.distance}>0.3 mi</Text>
            <Ionicons name="time-outline" size={14} color="#777" style={styles.timeIcon} />
            <Text style={styles.time}>15 min</Text>
          </View>
          
          {truck.promotion && (
            <View style={styles.promotionContainer}>
              <Ionicons name="pricetag-outline" size={14} color="#FF6B6B" />
              <Text style={styles.promotionText}>{truck.promotion}</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.orderButton} onPress={onPress}>
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.heartButton} 
          onPress={onRemoveFavorite}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="heart" size={22} color="#FF3B30" />
        </TouchableOpacity>
        
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {truck.available ? 'Open' : 'Closed'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Helper function to get emoji based on cuisine
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
    marginVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    position: 'relative',
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
  cuisineText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 5,
    flexShrink: 1, // Allow text to shrink if needed
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  promotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF0EE',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  promotionText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 3,
    fontWeight: '500',
  },
  heartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
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
  orderButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  }
});