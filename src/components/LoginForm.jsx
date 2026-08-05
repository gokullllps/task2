import { useState } from 'react';
import { validateLogin } from '../utils/validation';
import { validateCredentials, createSession } from '../utils/auth';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateLogin(username, password);
    setErrors(validationErrors);
    setAuthError('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (validateCredentials(username, password)) {
      createSession(username);
      onLogin();
    } else {
      setAuthError('Invalid username or password');
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          autoComplete="username"
          className={errors.username ? 'input-error' : ''}
        />
        {errors.username && <span className="error-text">{errors.username}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      {authError && <div className="auth-error">{authError}</div>}

      <button type="submit" className="btn btn-primary btn-block">
        Login
      </button>
    </form>
  );
}