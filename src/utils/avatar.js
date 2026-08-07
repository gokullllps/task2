/**
 * Saves base64 avatar image for specific user (noop - stored in MongoDB)
 */
export function saveUserAvatar(username, base64Image) {
  // Avatar images are persisted directly in MongoDB Database via API
  return;
}

/**
 * Retrieves stored avatar image for specific user (noop - loaded from MongoDB user state)
 */
export function getUserAvatar(username) {
  return null;
}

/**
 * Removes stored avatar image for specific user (noop - managed in MongoDB)
 */
export function removeUserAvatar(username) {
  return;
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
