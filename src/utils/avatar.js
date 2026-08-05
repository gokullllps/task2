const AVATAR_PREFIX = 'aether_avatar_';

/**
 * Saves base64 avatar image for specific user
 */
export function saveUserAvatar(username, base64Image) {
  if (!username) return;
  const key = `${AVATAR_PREFIX}${username.toLowerCase().trim()}`;
  try {
    localStorage.setItem(key, base64Image);
  } catch (err) {
    console.error('Error saving avatar to localStorage:', err);
  }
}

/**
 * Retrieves stored avatar image for specific user
 */
export function getUserAvatar(username) {
  if (!username) return null;
  const key = `${AVATAR_PREFIX}${username.toLowerCase().trim()}`;
  return localStorage.getItem(key) || null;
}

/**
 * Removes stored avatar image for specific user
 */
export function removeUserAvatar(username) {
  if (!username) return;
  const key = `${AVATAR_PREFIX}${username.toLowerCase().trim()}`;
  localStorage.removeItem(key);
}

/**
 * Converts File object to base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
