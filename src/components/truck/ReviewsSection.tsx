import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewsSectionProps {
  reviews: any[];
  sortBy: 'recent' | 'rating';
  onSortChange: (sort: 'recent' | 'rating') => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  sortBy,
  onSortChange,
}) => {
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  return (
    <>
      <View style={styles.reviewsHeader}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.reviewsFilter}>
          <TouchableOpacity onPress={() => onSortChange('recent')}>
            <Text style={sortBy === 'recent' ? styles.filterActive : styles.filterInactive}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSortChange('rating')}>
            <Text style={sortBy === 'rating' ? styles.filterActive : styles.filterInactive}>
              Rating
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.card}>
          <View style={styles.emptyReviews}>
            <Ionicons name="star" size={32} color="#F5CB5C" />
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        </View>
      ) : (
        sortedReviews.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.user_name || 'Anonymous'}</Text>
              <View style={styles.ratingContainer}>
                {[...Array(review.rating || 0)].map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#F28C28" />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))
      )}
    </>
  );
};

const styles = StyleSheet.create({
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewsFilter: {
    flexDirection: 'row',
  },
  filterActive: {
    color: '#F28C28',
    marginLeft: 12,
    fontWeight: '500',
  },
  filterInactive: {
    color: '#888',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
  },
});