import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const OrderCard = ({ order, onAccept, onComplete }) => {
  // Format the order created time as "X min ago"
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };
  
  // Format order number to show as #001, #004, etc.
  const orderNumber = String(parseInt(order.id.slice(-3), 10) || 0).padStart(3, '0');
  
  // Get customer name - handle both direct string and relationship object formats
  const customerName = 
    typeof order.customer_id === 'object' && order.customer_id !== null
      ? order.customer_id.name || 'Customer'
      : 'Customer';
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>Order #{orderNumber}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.customer}>
            {customerName} • {formatTimeAgo(order.created_at)}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemsList}>
        {order.menu_items && Array.isArray(order.menu_items) ? (
          order.menu_items.map((menuItem, index) => {
            // Handle both direct item and relationship formats
            const item = typeof menuItem === 'object' ? menuItem : { id: menuItem };
            return (
              <Text key={index} style={styles.item}>
                • {item.name || `Item ${index+1}`}
              </Text>
            );
          })
        ) : (
          <Text style={styles.item}>• Order items loading...</Text>
        )}
        
        {order.note && order.note.trim() && (
          <Text style={styles.note}>{order.note}</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.total}>${parseFloat(order.total_cost).toFixed(2)}</Text>
        
        {order.status === 'pending' && (
          <TouchableOpacity style={styles.actionButton} onPress={onAccept}>
            <Text style={styles.actionButtonText}>Start Processing</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'processing' && (
          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <Text style={styles.actionButtonText}>Mark as Ready</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'ready' && (
          <View style={styles.readyBadge}>
            <Text style={styles.readyText}>Ready for Pickup</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#F57F17',
  },
  customer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemsList: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  note: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  readyBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  readyText: {
    color: '#2E7D32',
    fontWeight: '500',
    fontSize: 14,
  },
});