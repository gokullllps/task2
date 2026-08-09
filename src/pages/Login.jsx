import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import BrandLogo from '../components/BrandLogo';
import { LockIcon } from '../components/Icons';
import { Button } from '../components/ui/Button';
import OtpInput from '../components/ui/OtpInput';
import { saveAccountSession } from '../utils/auth';
import api from '../utils/api';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  // OTP Verification Modal state
  const [otpData, setOtpData] = useState(null); // { email, username, password, message }
  const [otpInput, setOtpInput] = useState('');
  const [otpStatus, setOtpStatus] = useState({ error: '', success: '', loading: false });

  // 60-second Resend Countdown Timer
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const startResendTimer = () => {
    setTimer(60);
    setIsTimerActive(true);
  };

  const handleAuthResult = (user, otpInfo) => {
    if (otpInfo && otpInfo.requiresOtp) {
      setOtpData(otpInfo);
      setOtpInput('');
      setOtpStatus({ error: '', success: otpInfo.message || 'Verification OTP sent to your email.', loading: false });
      startResendTimer();
    } else if (user) {
      onLogin(user);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpStatus({ error: 'Please enter the 6-digit OTP code.', success: '', loading: false });
      return;
    }

    setOtpStatus({ error: '', success: '', loading: true });
    try {
      const data = await api.verifyRegisterOtp({
        username: otpData.username,
        email: otpData.email,
        password: otpData.password,
        otp: otpInput.trim(),
      });

      if (data.success && data.token && data.user) {
        setOtpStatus({ error: '', success: 'Email verified successfully! Entering workspace...', loading: false });
        saveAccountSession(data.user, data.token);
        setTimeout(() => {
          setOtpData(null);
          onLogin(data.user);
        }, 800);
      } else {
        setOtpStatus({ error: data.message || 'Verification failed. Please try again.', success: '', loading: false });
      }
    } catch (err) {
      console.error('OTP Verify Error:', err);
      const msg = err.data?.message || err.message || 'Invalid or expired OTP code.';
      setOtpStatus({ error: msg, success: '', loading: false });
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive) return;

    setOtpStatus({ error: '', success: '', loading: true });
    try {
      const data = await api.sendRegisterOtp({
        username: otpData?.username,
        email: otpData?.email,
        password: otpData?.password,
      });

      if (data.success) {
        setOtpStatus({ error: '', success: data.message || 'A fresh 6-digit OTP code has been sent to your email.', loading: false });
        setOtpInput('');
        startResendTimer();
      } else {
        setOtpStatus({ error: data.message || 'Failed to resend OTP.', success: '', loading: false });
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to resend OTP code.';
      setOtpStatus({ error: msg, success: '', loading: false });
    }
  };

  return (
    <div className="login-page">
      {/* Background Mesh Gradient Orbs */}
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />

      <div className="login-card glass-panel">
        <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <div className="login-logo-wrapper" style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
            <BrandLogo size={58} showText={false} />
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

        {/* Animated Segmented Control */}
        <div className="segmented-control" role="tablist" aria-label="Authentication Options">
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
            <LoginForm onLogin={handleAuthResult} />
          ) : (
            <RegisterForm onRegisterSuccess={handleAuthResult} />
          )}
        </div>
      </div>

      {/* Real Hostinger Email OTP Verification Modal Overlay */}
      {otpData && (
        <div className="modal-overlay">
          <div className="reset-modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Email Verification Required
              </h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setOtpData(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
              Enter the 6-digit verification code sent via Hostinger SMTP email to: <strong style={{ color: 'var(--accent-color)' }}>{otpData.email}</strong>.
            </p>

            {otpStatus.error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.84rem', marginTop: '10px' }}>
                {otpStatus.error}
              </div>
            )}
            {otpStatus.success && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.84rem', marginTop: '10px' }}>
                {otpStatus.success}
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>6-Digit Confirmation Code (Expires in 5m)</span>
                <OtpInput length={6} value={otpInput} onChange={setOtpInput} disabled={otpStatus.loading} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResendOtp}
                  disabled={isTimerActive || otpStatus.loading}
                  style={{ flex: 1 }}
                >
                  {isTimerActive ? `Resend (${timer}s)` : 'Resend OTP'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 2 }}
                  loading={otpStatus.loading}
                  disabled={otpInput.length !== 6}
                >
                  Verify & Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}