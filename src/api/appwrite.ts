import { Client, Account, Databases, ID, Query } from 'react-native-appwrite';
import {
  APPWRITE_DATABASE_ID,
  COLLECTION_USERS,
  COLLECTION_TRUCKS,
  COLLECTION_FAVORITES,
  COLLECTION_MENUS,
  COLLECTION_MENU_ITEMS,
  COLLECTION_REVIEWS,
  COLLECTION_ORDERS
} from '../constants/databaseConstants';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6830cbb3002ad78ac40e')
  .setPlatform('com.whatthetruck.appname');

export const account = new Account(client);
export const databases = new Databases(client);

// Auth: Sign up
export async function signUp(email: string, password: string) {
  return account.create(ID.unique(), email, password);
}

// Auth: Sign in
export async function signIn(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

// Auth: Get current user
export async function getCurrentUser() {
  return account.get();
}

// Auth: Sign out
export async function signOut() {
  return account.deleteSession('current');
}

// Fetch all trucks for a specific driver
export async function fetchTrucks(driverId?: string) {
  let res;
  if (driverId) {
    res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      [Query.equal('driver_id', driverId)]
    );
  } else {
    res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_TRUCKS);
  }
  return res.documents;
}

// Add a new truck
export async function addTruck({
  truck_name,
  cuisines,
  driver_id,
  description,
  license_number,
}: {
  truck_name: string;
  cuisines: string[];
  driver_id: string;
  description?: string;
  license_number?: string;
}) {
  try {
    const docId = ID.unique();
    const res = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      docId,
      {
        id: docId,
        truck_name,
        cuisines,
        description: description || '',
        license_number: license_number || '',
        available: false,
        created_at: new Date().toISOString(),
        driver_id,
      }
    );
    return res;
  } catch (error) {
    console.log('addTruck error:', error);
    throw error;
  }
}

// Update fetchProfileById to handle missing profiles properly
export async function fetchProfileById(userId: string) {
  try {
    const res = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_USERS,
      userId
    );
    return res;
  } catch (error: any) {
    console.log('fetchProfileById error:', error);
    
    // Don't return a default profile - return null instead
    if (error.code === 404 || error.message?.includes('not found')) {
      return null; // Return null, not a default profile
    }
    throw error; // Re-throw other errors
  }
}

// Update profile by user ID (document ID)
export async function updateProfileById(userId: string, updates: any) {
  const res = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    COLLECTION_USERS,
    userId,
    updates
  );
  return res;
}

// Fetch truck by ID
export async function fetchTruckById(truckId: string) {
  try {
    // Add nocache parameter to force fresh data
    const response = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      truckId
    );
    
    return response;
  } catch (error) {
    console.error('Error fetching truck:', error);
    return null;
  }
}

// Ensure this function is properly implemented

export async function updateTruckAvailability(truckId: string, available: boolean) {
  try {
    const updated = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      truckId,
      {
        available: available
      }
    );
    
    return updated;
  } catch (error) {
    console.error('Error updating truck availability:', error);
    return null;
  }
}

// Fetch menus for a specific truck
export async function fetchMenusByTruckId(truckId: string) {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENUS,
      [Query.equal('truck_id', truckId)]
    );
    return res.documents;
  } catch (error) {
    console.error('Error fetching menus by truck ID:', error);
    return [];
  }
}

// Fetch menu items for a specific menu
// This replaces/corrects the previous fetchMenuItemsByTruckId logic
export async function fetchMenuItemsByMenuId(menuId: string) {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENU_ITEMS,
      [Query.equal('menu_id', menuId)] // Correctly query by menu_id
    );
    return res.documents;
  } catch (error) {
    console.error('Error fetching menu items by menu ID:', error);
    return [];
  }
}

// Fetch reviews for a truck
export async function fetchReviewsByTruckId(truckId: string) {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_REVIEWS,
      [Query.equal('truck_id', truckId)]
    );
    return res.documents;
  } catch (error) {
    console.log('fetchReviewsByTruckId error:', error);
    return [];
  }
}

// Create user profile document
export async function createUserProfile(userId: string, data: {
  email: string;
  username: string;
  role: 'customer' | 'driver';
}) {
  try {
    const res = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_USERS,
      userId, // Use the auth user ID as document ID
      {
        ...data,
        created_at: new Date().toISOString(),
      }
    );
    return res;
  } catch (error) {
    console.log('createUserProfile error:', error);
    throw error;
  }
}

export async function createMenu(truckId: string, name: string, imageUrl?: string) {
  try {
    const newMenuId = ID.unique(); // Generate a unique ID
    const menu = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENUS,
      newMenuId, // Use the generated ID as the document's unique ID ($id)
      {
        id: newMenuId, // Provide the 'id' attribute in the data payload
        truck_id: truckId,
        name,
        image_url: imageUrl,
        created_at: new Date().toISOString(), // Consistent with addTruck and ensures string format
      }
    );
    return menu;
  } catch (error) {
    console.error('Error creating menu:', error);
    return null;
  }
}

export async function createMenuItem(
  menuId: string, 
  name: string, 
  price: number, 
  description?: string,
  imageUrl?: string
) {
  try {
    const newMenuItemId = ID.unique();
    const menuItem = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENU_ITEMS,
      newMenuItemId, // Use generated ID for the document $id
      {
        id: newMenuItemId, // Ensure 'id' attribute is populated if it's required in your schema
        menu_id: menuId,
        name,
        price,
        description,
        image_url: imageUrl,
        created_at: new Date().toISOString(), // Use toISOString for consistency
      }
    );
    return menuItem;
  } catch (error) {
    console.error('Error creating menu item:', error);
    return null;
  }
}

export async function updateMenuItem(
  itemId: string,
  updates: {
    name?: string;
    price?: number;
    description?: string;
    image_url?: string;
  }
) {
  try {
    const menuItem = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENU_ITEMS,
      itemId,
      updates
    );
    return menuItem;
  } catch (error) {
    console.error('Error updating menu item:', error);
    return null;
  }
}

// New function to update a menu
export async function updateMenu(
  menuId: string,
  updates: {
    name?: string;
    image_url?: string;
  }
) {
  try {
    const menu = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENUS,
      menuId,
      updates
    );
    return menu;
  } catch (error) {
    console.error('Error updating menu:', error);
    return null;
  }
}

export async function deleteMenu(menuId: string) {
  try {
    // First, delete all menu items in this menu
    const menuItems = await fetchMenuItemsByMenuId(menuId);
    for (const item of menuItems) {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_MENU_ITEMS,
        item.id
      );
    }
    
    // Then delete the menu itself
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENUS,
      menuId
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting menu:', error);
    return false;
  }
}

export async function deleteMenuItem(menuItemId: string) {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENU_ITEMS,
      menuItemId
    );
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
}

export async function fetchUserFavorites(userId: string) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_FAVORITES,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at')
      ]
    );
    
    console.log('Favorites response:', response);
    
    if (!response.documents || response.documents.length === 0) {
      return [];
    }
    
    // Fetch the truck details for each favorite
    const favoritesWithTrucks = await Promise.all(
      response.documents.map(async (favorite) => {
        try {
          // Validate truck_id before fetching
          if (!favorite.truck_id.id || favorite.truck_id.id.length > 36) {
            console.error('Invalid truck_id.id:', favorite.truck_id.id);
            return null;
          }
          
          const truck = await fetchTruckById(favorite.truck_id.id);
          return {
            ...favorite,
            truck: truck
          };
        } catch (error) {
          console.error('Error fetching truck for favorite:', error);
          return null;
        }
      })
    );
    
    // Filter out null values (failed fetches)
    return favoritesWithTrucks.filter(fav => fav !== null && fav.truck !== null);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
}

export async function updateTruckLocation(truckId: string, latitude: number, longitude: number) {
  try {
    const updated = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      truckId,
      {
        latitude,
        longitude,
        location_updated_at: new Date().toISOString()
      }
    );
    return updated;
  } catch (error) {
    console.error('Error updating truck location:', error);
    return null;
  }
}

export async function addFavorite(userId: string, truckId: string) {
  try {
    // Check if already favorited
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_FAVORITES,
      [
        Query.equal('user_id', userId),
        Query.equal('truck_id', truckId)
      ]
    );
    
    if (existing.documents.length > 0) {
      return existing.documents[0];
    }
    
    // Add new favorite
    const favorite = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_FAVORITES,
      ID.unique(),
      {
        user_id: userId,
        truck_id: truckId
      }
    );
    
    return favorite;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
}

export async function removeFavorite(userId: string, truckId: string) {
  try {
    const favorites = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_FAVORITES,
      [
        Query.equal('user_id', userId),
        Query.equal('truck_id', truckId)
      ]
    );
    
    if (favorites.documents.length > 0) {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_FAVORITES,
        favorites.documents[0].$id
      );
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

// Fetch truck menu items (handles the menus → menu_items relationship)
export async function fetchTruckMenu(truckId: string) {
  try {
    // First, get all menus for this truck
    const menus = await fetchMenusByTruckId(truckId);
    
    if (!menus || menus.length === 0) {
      return []; // No menus found for this truck
    }
    
    // Get all menu IDs
    const menuIds = menus.map(menu => menu.id);
    
    // Fetch all menu items for these menus
    let allMenuItems = [];
    
    // Since we can't query for multiple menu_ids at once with the current Appwrite setup,
    // we need to fetch items for each menu separately and combine them
    for (const menuId of menuIds) {
      const menuItems = await fetchMenuItemsByMenuId(menuId);
      
      // Add menu details to each item for better organization
      const menuDetails = menus.find(m => m.id === menuId);
      const itemsWithMenuInfo = menuItems.map(item => ({
        ...item,
        menu_name: menuDetails?.name || 'Unknown Menu',
        category: menuDetails?.name || 'Unknown Category', // Use menu name as category for grouping
        truck_id: truckId // Add truck_id for convenience
      }));
      
      allMenuItems = [...allMenuItems, ...itemsWithMenuInfo];
    }
    
    return allMenuItems;
  } catch (error) {
    console.error('Error fetching menu items for truck:', error);
    return [];
  }
}

// Submit order
export async function submitOrder(orderData: any) {
  try {
    // Generate a unique ID for the order
    const orderId = ID.unique();
    
    // Debug - log what we're trying to create
    console.log('Creating order with data structure:', {
      id: orderId,
      customer_id: orderData.user_id,
      truck_id: orderData.truck_id,
      menu_items: orderData.items,
      created_at: new Date().toISOString(),
      total_cost: orderData.total_price,
      status: orderData.status || 'processing',
      note: orderData.note || '',
    });
    
    // Create order with fields that match the schema exactly
    const order = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      orderId,
      {
        // Required fields (match the schema exactly):
        id: orderId,                                  // String (Required)
        customer_id: orderData.user_id,               // Relationship (Required)
        truck_id: orderData.truck_id,                 // Relationship (Required)
        menu_items: orderData.items,                  // Relationship (Required)
        created_at: new Date().toISOString(),         // Datetime (Required)
        total_cost: parseFloat(orderData.total_price),// Double (Required)
        status: orderData.status || 'processing',     // Enum (Required)
        
        // Optional fields:
        note: orderData.note || '',                   // String (Optional)
      }
    );
    
    return order;
  } catch (error) {
    // Enhanced error logging
    console.error('Error submitting order:', error);
    if (error.response) {
      console.error('Server response:', error.response);
    }
    throw error;
  }
}

// Get order details
export async function getOrderById(orderId: string) {
  try {
    const order = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      orderId
    );
    
    return order;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
}

// Add these functions to fetch user orders

export async function fetchUserOrders(userId: string) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      [
        Query.equal('customer_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(100)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

export async function fetchOrderById(orderId: string) {
  try {
    const response = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      orderId
    );
    
    return response;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
}

// Add this function to fetch orders for a specific truck

export async function fetchTruckOrders(truckId: string, limit = 5) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      [
        Query.equal('truck_id', truckId),
        Query.orderDesc('created_at'),
        Query.limit(limit)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching truck orders:', error);
    return [];
  }
}

// Add or update this function to fetch orders for a specific user's truck

export async function fetchRecentTruckOrders(truckId: string, limit = 5) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      [
        Query.equal('truck_id', truckId),
        Query.orderDesc('created_at'),
        Query.limit(limit)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching recent truck orders:', error);
    return [];
  }
}

/**
 * Fetch orders for a specific truck
 * @param truckId The ID of the truck to fetch orders for
 * @returns Array of orders with related data
 */
export async function fetchOrders(truckId: string) {
  try {
    console.log(`Fetching orders for truck ID: ${truckId}`);
    
    // Get all orders for this truck
    const ordersRes = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      [
        Query.equal('truck_id', truckId),
        Query.orderDesc('created_at')
      ]
    );
    
    console.log(`Found ${ordersRes.documents.length} orders`);
    
    // Process each order to properly include related data
    const processedOrders = await Promise.all(
      ordersRes.documents.map(async (order) => {
        try {
          // Get the truck details - since we already have truck_id as relationship
          let truckDetails = null;
          if (order.truck_id && typeof order.truck_id === 'object' && order.truck_id.$id) {
            try {
              truckDetails = await databases.getDocument(
                APPWRITE_DATABASE_ID,
                COLLECTION_TRUCKS,
                order.truck_id.$id
              );
            } catch (truckErr) {
              console.log(`Error fetching truck for order ${order.$id}:`, truckErr);
            }
          }
          
          // Handle menu_items relationship - as shown in your schema
          let menuItems = [];
          if (order.menu_items && Array.isArray(order.menu_items)) {
            // If menu_items is already populated, extract relevant info
            menuItems = order.menu_items.map(item => {
              // Handle if the item is a relationship object
              if (typeof item === 'object' && item.$id) {
                return {
                  id: item.$id,
                  name: item.name || 'Unknown item',
                  price: item.price || 0,
                  quantity: 1 // Default quantity
                };
              }
              return item;
            });
          } else if (order.menu_items && typeof order.menu_items === 'object' && !Array.isArray(order.menu_items)) {
            // If it's a single relationship object
            menuItems = [{
              id: order.menu_items.$id,
              name: order.menu_items.name || 'Unknown item',
              price: order.menu_items.price || 0,
              quantity: 1
            }];
          }
          
          // Get customer info if available
          let customerDetails = null;
          if (order.customer_id && typeof order.customer_id === 'object' && order.customer_id.$id) {
            try {
              customerDetails = await databases.getDocument(
                APPWRITE_DATABASE_ID,
                COLLECTION_USERS,
                order.customer_id.$id
              );
            } catch (customerErr) {
              console.log(`Error fetching customer for order ${order.$id}:`, customerErr);
            }
          }
          
          // Return the enriched order
          return {
            ...order,
            truck_details: truckDetails,
            processed_menu_items: menuItems,
            customer_details: customerDetails
          };
        } catch (err) {
          console.log(`Error processing order ${order.$id}:`, err);
          return order; // Return the original order if processing failed
        }
      })
    );
    
    return processedOrders;
  } catch (error) {
    console.error('fetchOrders error:', error);
    return []; // Return empty array instead of throwing to prevent app crashes
  }
}

/**
 * Update the status of an order
 * @param orderId The ID of the order to update
 * @param status The new status for the order
 * @returns Updated order document
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const res = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      orderId,
      { 
        status: status,
        updated_at: new Date().toISOString()
      }
    );
    return res;
  } catch (error) {
    console.log('updateOrderStatus error:', error);
    throw error;
  }
}

/**
 * Cancel an order
 * @param orderId The ID of the order to cancel
 * @returns Success or error
 */
export async function cancelOrder(orderId: string) {
  try {
    // Option 1: Update status to cancelled
    const res = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      orderId,
      { 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      }
    );
    return res;
    
    // Option 2: Delete the order completely
    // Uncomment this and comment the above if you prefer deletion
    /*
    const res = await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_ORDERS,
      orderId
    );
    return res;
    */
  } catch (error) {
    console.log('cancelOrder error:', error);
    throw error;
  }
}