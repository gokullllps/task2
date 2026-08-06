import React, { useState } from 'react';
import { validateLogin } from '../utils/validation';
import { validateCredentials, createSession } from '../utils/auth';
import { UserIcon, LockIcon } from './Icons';
import { TextInput } from './ui/Input';
import { Button } from './ui/Button';

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
      <TextInput
        id="username"
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        autoComplete="username"
        icon={UserIcon}
        error={errors.username}
        disabled={isSubmitting}
      />

      <TextInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        autoComplete="current-password"
        icon={LockIcon}
        showPasswordToggle={true}
        error={errors.password}
        disabled={isSubmitting}
      />

      {authError && <div className="auth-error">{authError}</div>}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        block={true}
        loading={isSubmitting}
      >
        Sign In
      </Button>
    </form>
  );
}