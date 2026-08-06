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
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
        autoComplete="email"
        icon={MailIcon}
        error={errors.email}
        disabled={isSubmitting}
      />

      <TextInput
        id="reg-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        autoComplete="new-password"
        icon={LockIcon}
        showPasswordToggle={true}
        error={errors.password}
        disabled={isSubmitting}
      />

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

      {authError && <div className="auth-error">{authError}</div>}
      {successMessage && <div className="auth-success">{successMessage}</div>}

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

