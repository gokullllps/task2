// Simple hardcoded authentication utility.
// In a real application these credentials would be validated against a backend.

const SESSION_KEY = 'todoapp_session';
const VALID_USERNAME = 'goku';
const VALID_PASSWORD = 'goku123';

/**
 * Validates a username/password pair against the hardcoded credentials.
 */
export function validateCredentials(username, password) {
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

/**
 * Creates a login session and stores it in localStorage.
 */
export function createSession(username) {
  const session = {
    username,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Retrieves the current session from localStorage, if any.
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

/**
 * Clears the stored session (logout).
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}