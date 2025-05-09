// localStorage utility functions for data persistence

// Key constants to avoid typos
export const localStorageKeys = {
  USER: 'tutalink_user',
  NOTIFICATIONS: 'tutalink_notifications',
  TUTORS: 'tutalink_tutors',
  BOOKINGS: 'tutalink_bookings',
  COURSES: 'tutalink_courses',
  REVIEWS: 'tutalink_reviews',
  SETTINGS: 'tutalink_settings',
};

// Generic function to get items from localStorage with type safety
export function getLocalStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return null;
  }
}

// Function to set items in localStorage
export function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
}

// Function to remove items from localStorage
export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
  }
}

// Function to clear all app-related localStorage items
export function clearAppLocalStorage(): void {
  try {
    Object.values(localStorageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app localStorage', error);
  }
}

// Utility to append to an array stored in localStorage
export function appendToLocalStorageArray<T>(key: string, item: T): T[] {
  const existingItems = getLocalStorageItem<T[]>(key) || [];
  const newItems = [...existingItems, item];
  setLocalStorageItem(key, newItems);
  return newItems;
}

// Utility to update an item in an array stored in localStorage
export function updateLocalStorageArrayItem<T extends { id: number | string }>(
  key: string,
  id: number | string,
  updatedItem: Partial<T>
): T[] {
  const existingItems = getLocalStorageItem<T[]>(key) || [];
  const newItems = existingItems.map(item => 
    item.id === id ? { ...item, ...updatedItem } : item
  );
  setLocalStorageItem(key, newItems);
  return newItems;
}

// Utility to remove an item from an array stored in localStorage
export function removeFromLocalStorageArray<T extends { id: number | string }>(
  key: string,
  id: number | string
): T[] {
  const existingItems = getLocalStorageItem<T[]>(key) || [];
  const newItems = existingItems.filter(item => item.id !== id);
  setLocalStorageItem(key, newItems);
  return newItems;
}
