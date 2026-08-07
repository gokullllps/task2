import api, { setToken, removeToken, getToken } from './api';

const USER_INFO_KEY = 'todoapp_user_info';
const SAVED_ACCOUNTS_KEY = 'todoapp_saved_accounts';

/**
 * Gets all saved logged-in accounts on device
 */
export function getSavedAccounts() {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Saves/updates an account session in multi-account storage and marks it active
 */
export function saveAccountSession(user, token) {
  if (!user || !token) return;

  const userId = user.id || user._id;
  const username = user.username || 'User';
  const email = user.email || `${username.toLowerCase()}@praskla.com`;

  let accounts = getSavedAccounts();

  // Mark all existing accounts as non-active
  accounts = accounts.map((acc) => ({ ...acc, active: false }));

  const existingIdx = accounts.findIndex(
    (acc) => (acc.id && acc.id === userId) || acc.username.toLowerCase() === username.toLowerCase()
  );

  const newAccountObj = {
    id: userId,
    username,
    email,
    token,
    active: true,
    lastActive: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    accounts[existingIdx] = newAccountObj;
  } else {
    accounts.push(newAccountObj);
  }

  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  setToken(token);
}

/**
 * Switches current active account on device without logging out other accounts
 */
export function switchAccountSession(targetUserId) {
  let accounts = getSavedAccounts();
  const targetAcc = accounts.find(
    (acc) => acc.id === targetUserId || acc.username.toLowerCase() === (targetUserId || '').toLowerCase()
  );

  if (!targetAcc) return null;

  accounts = accounts.map((acc) => ({
    ...acc,
    active: acc.id === targetAcc.id || acc.username.toLowerCase() === targetAcc.username.toLowerCase(),
  }));

  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  setToken(targetAcc.token);

  const userInfo = {
    id: targetAcc.id,
    username: targetAcc.username,
    email: targetAcc.email,
  };

  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  return userInfo;
}

/**
 * Removes a specific account from device saved accounts
 */
export function removeSavedAccount(targetUserId) {
  let accounts = getSavedAccounts();
  accounts = accounts.filter(
    (acc) => acc.id !== targetUserId && acc.username.toLowerCase() !== (targetUserId || '').toLowerCase()
  );
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));

  const remainingActive = accounts.find((acc) => acc.active);
  if (remainingActive) {
    return switchAccountSession(remainingActive.id);
  } else if (accounts.length > 0) {
    return switchAccountSession(accounts[0].id);
  } else {
    removeToken();
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
}

/**
 * Registers a new user via the backend API and automatically saves session locally on device
 */
export async function registerUser({ username, email, password }) {
  try {
    const data = await api.sendRegisterOtp({ username, email, password });
    if (data.success) {
      return { success: true, requiresOtp: true, username, email, password, message: data.message };
    }
    return { success: false, error: data.message || 'Failed to send registration OTP.' };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message || 'Registration failed. Please try again.',
    };
  }
}

/**
 * Validates login credentials via backend API and automatically saves session locally on device
 */
export async function validateCredentials(identifier, password) {
  try {
    const data = await api.login({ identifier, password });
    if (data.requiresOtp) {
      return { valid: false, requiresOtp: true, email: data.email, message: data.message, devOtp: data.devOtp };
    }
    if (data.token && data.user) {
      saveAccountSession(data.user, data.token);
    }
    return {
      valid: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Invalid credentials',
    };
  }
}

/**
 * Creates/stores session info.
 */
export function createSession(user) {
  const userInfo = {
    username: typeof user === 'string' ? user : user.username,
    email: typeof user === 'object' && user.email ? user.email : '',
    id: typeof user === 'object' ? user.id || user._id : null,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  return userInfo;
}

/**
 * Synchronously retrieves stored cached user from localStorage.
 */
export function getSession() {
  try {
    const token = getToken();
    if (!token) return null;
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

/**
 * Asynchronously verifies current session token with backend API /api/auth/me
 */
export async function verifyCurrentSession() {
  const token = getToken();
  if (!token) return null;

  try {
    const data = await api.getMe();
    if (data.success && data.user) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  } catch (error) {
    console.warn('[Session Verify] Invalid session or token expired:', error.message);
    return null;
  }
}

/**
 * Clears current active token and session, calls backend logout.
 */
export async function clearSession() {
  try {
    await api.logout();
  } catch (error) {
    // Ignore network errors
  } finally {
    const accounts = getSavedAccounts();
    const activeAcc = accounts.find((a) => a.active);
    if (activeAcc) {
      removeSavedAccount(activeAcc.id);
    } else {
      removeToken();
      localStorage.removeItem(USER_INFO_KEY);
    }
  }
}