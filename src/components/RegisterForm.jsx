import React, { useState } from 'react';
import { validateRegister } from '../utils/validation';
import { registerUser, createSession } from '../utils/auth';
import { UserIcon, MailIcon, LockIcon } from './Icons';
import { TextInput } from './ui/Input';
import { Button } from './ui/Button';

export default function RegisterForm({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password Strength Criteria Evaluation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&^#_\-\+=~]/.test(password);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateRegister(username, email, password, confirmPassword);

    if (!isPasswordStrong) {
      validationErrors.password =
        'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';
    }

    setErrors(validationErrors);
    setAuthError('');
    setSuccessMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({ username, email, password });

      if (result.requiresOtp) {
        if (onRegisterSuccess) {
          onRegisterSuccess(null, {
            requiresOtp: true,
            username: result.username || username,
            email: result.email || email,
            password: result.password || password,
            message: result.message,
          });
        }
      } else if (result.success) {
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
    <form className="auth-form-container" onSubmit={handleSubmit} noValidate>
      <TextInput
        id="reg-username"
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Choose a username"
        autoComplete="username"
        icon={UserIcon}
        error={errors.username}
        disabled={isSubmitting}
      />

      <TextInput
        id="reg-email"
        label="Email Address (1 Account Per Email)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
        autoComplete="email"
        icon={MailIcon}
        error={errors.email}
        disabled={isSubmitting}
      />

      <div className="form-field-group">
        <TextInput
          id="reg-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 chars (1 upper, 1 lower, 1 num, 1 special)"
          autoComplete="new-password"
          icon={LockIcon}
          showPasswordToggle={true}
          error={errors.password}
          disabled={isSubmitting}
        />

        {/* Real-time Strong Password Criteria Checklist */}
        <div className="password-criteria-box">
          <div className="criteria-title">Password Security Requirements:</div>
          <div className="criteria-list">
            <div className={`criteria-item ${hasMinLength ? 'valid' : ''}`}>
              <div className="criteria-bullet" />
              <span>Min 8 characters</span>
            </div>
            <div className={`criteria-item ${hasUpper ? 'valid' : ''}`}>
              <div className="criteria-bullet" />
              <span>1 Uppercase letter (A-Z)</span>
            </div>
            <div className={`criteria-item ${hasLower ? 'valid' : ''}`}>
              <div className="criteria-bullet" />
              <span>1 Lowercase letter (a-z)</span>
            </div>
            <div className={`criteria-item ${hasNumber ? 'valid' : ''}`}>
              <div className="criteria-bullet" />
              <span>1 Number (0-9)</span>
            </div>
            <div className={`criteria-item ${hasSpecial ? 'valid' : ''}`} style={{ gridColumn: 'span 2' }}>
              <div className="criteria-bullet" />
              <span>1 Special character (@ $ ! % * ? & ^ # _ - + = ~)</span>
            </div>
          </div>
        </div>
      </div>

      <TextInput
        id="reg-confirm-password"
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter password"
        autoComplete="new-password"
        icon={LockIcon}
        showPasswordToggle={true}
        error={errors.confirmPassword}
        disabled={isSubmitting}
      />

      {authError && <div className="auth-error" style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.85rem' }}>{authError}</div>}
      {successMessage && <div className="auth-success" style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.85rem' }}>{successMessage}</div>}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        block={true}
        loading={isSubmitting}
      >
        Create Account
      </Button>
    </form>
  );
}


