import React, { useState } from 'react';
import { validateLogin } from '../utils/validation';
import { validateCredentials, createSession } from '../utils/auth';
import { UserIcon, LockIcon } from './Icons';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateLogin(username, password);
    setErrors(validationErrors);
    setAuthError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await validateCredentials(username, password);

      if (result.valid) {
        createSession(result.user);
        onLogin(result.user);
      } else {
        setAuthError(result.error || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('An error occurred while validating credentials');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="username">
          <span>Username</span>
        </label>
        <div className="input-with-icon">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            className={errors.username ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          <UserIcon size={18} className="field-icon" />
        </div>
        {errors.username && <span className="error-text">{errors.username}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">
          <span>Password</span>
        </label>
        <div className="input-with-icon">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            className={errors.password ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          <LockIcon size={18} className="field-icon" />
        </div>
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      {authError && <div className="auth-error">{authError}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}