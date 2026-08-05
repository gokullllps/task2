import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that syncs a piece of state with localStorage.
 * Behaves like useState, but persists the value under the given key.
 * Safely handles dynamic key switches without stale storage writes.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - fallback value if nothing is stored yet
 * @returns {[*, Function]} current value and setter function
 */
export default function useLocalStorage(key, initialValue) {
  const prevKeyRef = useRef(key);

  const [value, setValue] = useState(() => {
    try {
      const storedItem = localStorage.getItem(key);
      return storedItem !== null ? JSON.parse(storedItem) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    // If the storage key changed (e.g. switching accounts), re-read from new key
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      try {
        const storedItem = localStorage.getItem(key);
        setValue(storedItem !== null ? JSON.parse(storedItem) : initialValue);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setValue(initialValue);
      }
    } else {
      // Key is stable, write updated value to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
}