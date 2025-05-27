import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderItemCardProps {
  order: {
    id: string;
    status: 'processing' | 'preparing' | 'ready' | 'completed' | 'new' | 'cancelled';
    customer: {
      name: string;
      paymentMethod: 'card' | 'cash';
    };
    truck: {
      name: string;
    };
    items: Array<{
      name: string;
      quantity?: number;
    }>;
    specialInstructions?: string;
    createdAt: string;
    estimatedTime?: string;
    total: number;
  };
  onMarkReady?: () => void;
  onCompleteOrder?: () => void;
  onCancelOrder?: () => void;
}

export const OrderItemCard = ({ order, onMarkReady, onCompleteOrder, onCancelOrder }: OrderItemCardProps) => {
  // Format order ID to show in a more compact way if too long
  const orderNumberDisplay = order.id.length > 12 
    ? `#${order.id.substring(0, 6)}...${order.id.substring(order.id.length - 4)}`
    : `#${order.id}`;
  
  // Format time
  const timeDisplay = formatTime(order.estimatedTime || order.createdAt);
  
  // Format price 
  const priceDisplay = order.total ? `$${order.total.toFixed(2)}` : '$0.00';
  
  // Format status for display
  const getStatusLabel = () => {
    switch(order.status) {
      case 'new':
        return { label: 'New', icon: 'time-outline', color: '#1976D2', bgColor: '#E3F2FD' };
      case 'processing':
        return { label: 'Processing', icon: 'sync-outline', color: '#7B1FA2', bgColor: '#F3E5F5' };
      case 'preparing':
        return { label: 'Preparing', icon: 'flame-outline', color: '#FFA000', bgColor: '#FFF8E1' };
      case 'ready':
        return { label: 'Ready', icon: 'checkmark-circle-outline', color: '#2E7D32', bgColor: '#E8F5E9' };
      case 'completed':
        return { label: 'Completed', icon: 'checkmark-done-outline', color: '#455A64', bgColor: '#ECEFF1' };
      case 'cancelled':
        return { label: 'Cancelled', icon: 'close-circle-outline', color: '#C62828', bgColor: '#FFEBEE' };
      default:
        return { label: order.status, icon: 'help-outline', color: '#757575', bgColor: '#EEEEEE' };
    }
  };
  
  const statusInfo = getStatusLabel();
  
  // Make order items more resilient to data issues
  const renderOrderItems = () => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return (
        <View style={styles.emptyItemsContainer}>
          <Text style={styles.emptyItemsText}>No items in this order</Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsContainer}>
        {order.items.map((item, index) => {
          // Handle different item formats based on all possible structures
          let itemName = '';
          let quantity = 1;
          
          if (typeof item === 'string') {
            // Simple string format
            itemName = item;
          } else if (typeof item === 'object') {
            // Object format - try all possible property names
            itemName = item.name || 
                       item.item_name || 
                       item.product_name || 
                       (item.item ? item.item.name : 'Unknown item');
                       
            quantity = item.quantity || 1;
          }
          
          return (
            <View key={index} style={styles.itemPill}>
              <Text style={styles.itemText} numberOfLines={1}>
                {quantity > 1 ? `${itemName} x${quantity}` : itemName}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Order header with ID, status, time and price */}
      <View style={styles.header}>
        <View style={styles.idAndStatus}>
          <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="middle">
            {orderNumberDisplay}
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.timeAndPrice}>
          <Text style={styles.time}>
            <Ionicons name="time-outline" size={14} color="#757575" /> {timeDisplay}
          </Text>
          <Text style={styles.price} numberOfLines={1}>
            {priceDisplay}
          </Text>
        </View>
      </View>
      
      {/* Customer info row */}
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color="#757575" style={styles.infoIcon} />
        <Text style={styles.infoName} numberOfLines={1}>
          {order.customer.name || 'Customer'}
        </Text>
        <Text style={styles.infoDetail}>• {order.customer.paymentMethod || 'Card'}</Text>
      </View>
      
      {/* Truck info row */}
      <View style={styles.infoRow}>
        <Ionicons name="restaurant-outline" size={16} color="#757575" style={styles.infoIcon} />
        <Text style={styles.infoName} numberOfLines={1}>
          {order.truck.name || 'Unknown Truck'}
        </Text>
        <Text style={styles.infoDetail}>• Est. {timeDisplay}</Text>
      </View>
      
      {/* Order items */}
      {renderOrderItems()}
      
      {/* Special instructions if any */}
      {order.specialInstructions && (
        <View style={styles.specialInstructions}>
          <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" style={styles.specialIcon} />
          <Text style={styles.specialText} numberOfLines={2}>
            Special: {order.specialInstructions}
          </Text>
        </View>
      )}
      
      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {order.status === 'ready' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]} 
            onPress={onCompleteOrder}
          >
            <Text style={styles.completeButtonText}>Complete Order</Text>
          </TouchableOpacity>
        )}
        {(order.status === 'new' || order.status === 'processing' || order.status === 'preparing') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.readyButton]} 
            onPress={onMarkReady}
          >
            <Text style={styles.readyButtonText}>Mark Ready</Text>
          </TouchableOpacity>
        )}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={onCancelOrder}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Helper function to format time
const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'N/A';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginRight: 10,
    maxWidth: 130,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeAndPrice: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 5,
  },
  infoName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
    flex: 1,
  },
  infoDetail: {
    fontSize: 13,
    color: '#757575',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 12,
  },
  emptyItemsContainer: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center'
  },
  emptyItemsText: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic'
  },
  itemPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 13,
    color: '#555',
  },
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  specialIcon: {
    marginRight: 6,
  },
  specialText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyButton: {
    backgroundColor: '#2E7D32',
    marginRight: 8,
    flex: 2,
  },
  readyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: '#455A64',
    marginRight: 8,
    flex: 2,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    flex: 1,
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 14,
  },
});