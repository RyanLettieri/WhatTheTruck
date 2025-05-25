import { Client, Account, Databases, ID, Query } from 'react-native-appwrite';
import {
  APPWRITE_DATABASE_ID,
  COLLECTION_USERS,
  COLLECTION_TRUCKS,
  COLLECTION_FAVORITES,
  COLLECTION_MENUS,
  COLLECTION_MENU_ITEMS,
  COLLECTION_REVIEWS
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
export async function fetchTruckById(id: string) {
  try {
    const res = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      id
    );
    return res;
  } catch (error) {
    console.log('fetchTruckById error:', error);
    return null;
  }
}

export async function updateTruckAvailability(truckId: string, available: boolean) {
  try {
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_TRUCKS,
      truckId,
      { available }
    );
  } catch (error) {
    console.log('updateTruckAvailability error:', error);
    return null;
  }
}

// Fetch menu items for a truck
export async function fetchMenuItemsByTruckId(truckId: string) {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_MENU_ITEMS,
      [Query.equal('truck_id', truckId)]
    );
    return res.documents;
  } catch (error) {
    console.log('fetchMenuItemsByTruckId error:', error);
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