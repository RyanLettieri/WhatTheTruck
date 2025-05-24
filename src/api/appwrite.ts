import { Client, Account, Databases, ID, Query } from 'react-native-appwrite';
import {
  APPWRITE_DATABASE_ID,
  COLLECTION_USERS,
  COLLECTION_TRUCKS,
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
}: {
  truck_name: string;
  cuisines: string[];
  driver_id: string;
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
        available: true,
        created_at: new Date().toISOString(),
        driver_id,
      }
    );
    return res;
  } catch (error) {
    console.log('addTruck error:', error);
    return null;
  }
}

// Fetch profile by user ID (document ID)
export async function fetchProfileById(userId: string) {
  try {
    const res = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_USERS,
      userId
    );
    return res;
  } catch (error) {
    console.log('fetchProfileById error:', error);
    return null;
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