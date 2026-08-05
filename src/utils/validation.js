// Shared validation helpers for forms across the app.

/**
 * Validates login form fields.
 * @returns {Object} errors object, empty if valid
 */
export function validateLogin(username, password) {
  const errors = {};
  if (!username || !username.trim()) {
    errors.username = 'Username is required';
  }
  if (!password || !password.trim()) {
    errors.password = 'Password is required';
  }
  return errors;
}

/**
 * Validates todo title/description fields.
 * @returns {Object} errors object, empty if valid
 */
export function validateTodo(title, description) {
  const errors = {};
  if (!title || !title.trim()) {
    errors.title = 'Title cannot be empty';
  }
  if (!description || !description.trim()) {
    errors.description = 'Description cannot be empty';
  }
  return errors;
}