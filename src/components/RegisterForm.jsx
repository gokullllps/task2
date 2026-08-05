import React, { useState } from 'react';
import { validateRegister } from '../utils/validation';
import { registerUser, createSession } from '../utils/auth';
import { UserIcon, MailIcon, LockIcon } from './Icons';

export default function RegisterForm({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateRegister(username, email, password, confirmPassword);
    setErrors(validationErrors);
    setAuthError('');
    setSuccessMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({ username, email, password });

      if (result.success) {
        setSuccessMessage('Account created successfully! Signing in...');
        createSession(result.user);
        setTimeout(() => {
          onRegisterSuccess(result.user);
        }, 800);
      } else {
        setAuthError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="reg-username">
          <span>Username</span>
        </label>
        <div className="input-with-icon">
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            autoComplete="username"
            className={errors.username ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          <UserIcon size={18} className="field-icon" />
        </div>
        {errors.username && <span className="error-text">{errors.username}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-email">
          <span>Email Address</span>
        </label>
        <div className="input-with-icon">
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            className={errors.email ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          <MailIcon size={18} className="field-icon" />
        </div>
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-password">
          <span>Password</span>
        </label>
        <div className="input-with-icon">
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className={errors.password ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          <LockIcon size={18} className="field-icon" />
        </div>
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-confirm-password">
          <span>Confirm Password</span>
        </label>
        <div className="input-with-icon">
          <input
            id="reg-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            className={errors.confirmPassword ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          <LockIcon size={18} className="field-icon" />
        </div>
        {errors.confirmPassword && (
          <span className="error-text">{errors.confirmPassword}</span>
        )}
      </div>

      {authError && <div className="auth-error">{authError}</div>}
      {successMessage && <div className="auth-success">{successMessage}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}
