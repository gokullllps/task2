import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { TaskIcon, LockIcon } from '../components/Icons';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-badge">
            <TaskIcon size={26} />
          </div>
          <h1 className="login-title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="login-subtitle">
            {activeTab === 'login'
              ? 'Sign in to access your task workspace'
              : 'Register to manage your productivity workflow'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <LoginForm onLogin={onLogin} />
        ) : (
          <RegisterForm onRegisterSuccess={onLogin} />
        )}

        <div className="login-footer">
          {activeTab === 'login' && (
            <p className="login-hint">
              Demo Credentials: <strong>goku</strong> / <strong>goku123</strong>
            </p>
          )}

          <div className="security-notice">
            <LockIcon size={14} />
            <span>JWT Auth & bcrypt Password Hashing Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}