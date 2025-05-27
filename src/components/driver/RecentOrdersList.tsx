import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffMins < 1440) { // Less than a day
    return `${Math.floor(diffMins / 60)} hours ago`;
  } else {
    return `${Math.floor(diffMins / 1440)} days ago`;
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'ready':
      return '#32CD32';
    case 'processing':
      return '#4285F4';
    case 'pending':
      return '#FFC107';
    default:
      return '#888';
  }
};

// Update the OrderItem component to handle possible undefined/null values
const OrderItem = ({ order }) => {
  // Handle potential missing data more gracefully
  if (!order) return null;
  
  // Format the order number to show as #001, #002, etc.
  const orderNumber = order.id ? String(parseInt(order.id.slice(-3), 10) || 0).padStart(3, '0') : '000';
  
  // Get customer name - handle both direct string and relationship object formats
  const customerName = 
    typeof order.customer_id === 'object' && order.customer_id !== null
      ? order.customer_id.name || 'Customer'
      : order.customer_name || 'Customer';
  
  // Handle potentially missing created_at
  const timeDisplay = order.created_at 
    ? formatTimeAgo(order.created_at)
    : 'Recently';
    
  // Handle potentially missing or invalid total_cost
  const totalCost = order.total_cost 
    ? parseFloat(order.total_cost)
    : 0;
  
  return (
    <View style={styles.orderItem}>
      <View>
        <Text style={styles.orderNumber}>#{orderNumber} - {customerName}</Text>
        <Text style={styles.orderTime}>{timeDisplay}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderPrice}>${totalCost.toFixed(2)}</Text>
        <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status || 'pending') + '20' }]}>
          <Text style={[styles.orderStatusText, { color: getStatusColor(order.status || 'pending') }]}>
            {order.status || 'pending'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Update the RecentOrdersList component for better handling of array data
export const RecentOrdersList = ({ orders, loading, onViewAll }) => {
  const hasOrders = Array.isArray(orders) && orders.length > 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Orders</Text>
        <TouchableOpacity onPress={onViewAll} disabled={!hasOrders}>
          <Text style={[
            styles.viewAllText,
            !hasOrders && styles.disabledText
          ]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color="#888" style={styles.loader} />
      ) : hasOrders ? (
        <View>
          {orders.map((order, index) => (
            <OrderItem key={order.id || index} order={order} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent orders</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  disabledText: {
    opacity: 0.5,
  }
});