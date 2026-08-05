import { useState, useEffect } from 'react';

/**
 * Custom hook that syncs a piece of state with localStorage.
 * Behaves like useState, but persists the value under the given key.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - fallback value if nothing is stored yet
 * @returns {[*, Function]} current value and setter function
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const storedItem = localStorage.getItem(key);
      return storedItem ? JSON.parse(storedItem) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}