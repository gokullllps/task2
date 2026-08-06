import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { TaskIcon, LockIcon } from '../components/Icons';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="login-page">
      {/* Background Mesh Gradient Orbs */}
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />

      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="login-logo-badge">
            <TaskIcon size={28} />
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

        {/* Animated Segmented Control (Inspired by Reference Image 4) */}
        <div className="segmented-control" role="tablist" aria-label="Authentication Options">
          <div
            className="segmented-indicator"
            style={{
              left: activeTab === 'login' ? '4px' : 'calc(50%)',
            }}
          />
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`segmented-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`segmented-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-form-container">
          {activeTab === 'login' ? (
            <LoginForm onLogin={onLogin} />
          ) : (
            <RegisterForm onRegisterSuccess={onLogin} />
          )}
        </div>

        <div className="login-footer">
          <div className="security-notice">
            <LockIcon size={14} />
            <span>JWT Auth & bcrypt Password Hashing Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}