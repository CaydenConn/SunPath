/**
 * User Service
 * Handles all user-related API calls to the backend
 */

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { API_BASE_URL } from '@env';

// Fallback to localhost if not set in .env
const BASE_URL = API_BASE_URL || (__DEV__ 
  ? 'http://localhost:5000'  // Development
  : 'https://your-production-url.com');  // Production

export interface Address {
  address: string;
  latitude: number;
  longitude: number;
  label?: string;
  timestamp?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  created_at: string;
  updated_at: string;
  favorite_addresses: Address[];
  recent_addresses: Address[];
}

/**
 * Get the current user's Firebase ID token
 */
async function getAuthToken(): Promise<string> {
  const user = FIREBASE_AUTH.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return await user.getIdToken();
}

/**
 * Make an authenticated API request
 */
async function apiRequest(
  endpoint: string, 
  method: string = 'GET', 
  body?: any
): Promise<any> {
  try {
    const token = await getAuthToken();
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

/**
 * User Profile Operations
 */

export async function createUserProfile(email: string): Promise<UserProfile> {
  const response = await apiRequest('/api/users/create', 'POST', { email });
  return response.user;
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiRequest('/api/users/profile', 'GET');
  return response.user;
}

export async function deleteUserProfile(): Promise<void> {
  await apiRequest('/api/users/profile', 'DELETE');
}

/**
 * Favorite Addresses Operations
 */

export async function getFavoriteAddresses(): Promise<Address[]> {
  const response = await apiRequest('/api/users/favorites', 'GET');
  return response.favorites;
}

export async function addFavoriteAddress(address: Address): Promise<Address[]> {
  const response = await apiRequest('/api/users/favorites', 'POST', address);
  return response.favorites;
}

export async function removeFavoriteAddress(
  latitude: number, 
  longitude: number
): Promise<Address[]> {
  const response = await apiRequest('/api/users/favorites', 'DELETE', {
    latitude,
    longitude
  });
  return response.favorites;
}

/**
 * Recent Addresses Operations
 */

export async function getRecentAddresses(): Promise<Address[]> {
  const response = await apiRequest('/api/users/recent', 'GET');
  return response.recent;
}

export async function addRecentAddress(address: Address): Promise<Address[]> {
  const response = await apiRequest('/api/users/recent', 'POST', address);
  return response.recent;
}

/**
 * Helper function to track navigation
 * Call this when a user navigates to an address
 */
export async function trackNavigation(
  address: string,
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  try {
    await addRecentAddress({
      address,
      latitude,
      longitude,
      label
    });
  } catch (error) {
    console.error('Failed to track navigation:', error);
    // Don't throw - navigation tracking shouldn't block the app
  }
}

/**
 * Check if user profile exists, create if not
 * Call this after successful login/signup
 */
export async function ensureUserProfile(email: string): Promise<UserProfile> {
  try {
    // Try to get existing profile
    const profile = await getUserProfile();
    console.log('User profile already exists');
    return profile;
  } catch (error: any) {
    // Profile doesn't exist, create it
    if (error.message === 'User not found') {
      console.log('Creating new user profile...');
      return await createUserProfile(email);
    }
    // Some other error occurred
    throw error;
  }
}

