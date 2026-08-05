import LoginForm from '../components/LoginForm';
import '../styles/login.css';

export default function Login({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">📝</div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to manage your tasks</p>

        <LoginForm onLogin={onLogin} />

        <p className="login-hint">
          Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}