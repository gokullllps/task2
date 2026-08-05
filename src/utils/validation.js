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
 * Validates registration form fields.
 * @returns {Object} errors object, empty if valid
 */
export function validateRegister(username, email, password, confirmPassword) {
  const errors = {};

  if (!username || !username.trim()) {
    errors.username = 'Username is required';
  } else if (username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    errors.email = 'Email address is required';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
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