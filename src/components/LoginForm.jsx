import React, { useState, useEffect } from 'react';
import { validateLogin } from '../utils/validation';
import { validateCredentials, createSession } from '../utils/auth';
import { UserIcon, LockIcon, MailIcon } from './Icons';
import { TextInput } from './ui/Input';
import { Button } from './ui/Button';
import OtpInput from './ui/OtpInput';
import api from '../utils/api';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState({ error: '', success: '', loading: false });

  // 60-Second Resend Countdown Timer
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

  // Password criteria for reset
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&^#_\-\+=~]/.test(newPassword);
  const isResetPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

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
        setAuthError(result.error || 'Invalid credentials. Please verify your username and password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('An error occurred while validating credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Forgot Password Step 1: Send OTP via Hostinger SMTP
  async function handleSendForgotOtp(e) {
    if (e) e.preventDefault();
    if (!resetEmail || !resetEmail.trim()) {
      setResetStatus({ error: 'Please enter your registered email address.', success: '', loading: false });
      return;
    }

    setResetStatus({ error: '', success: '', loading: true });
    try {
      const res = await api.sendForgotOtp(resetEmail.trim());
      if (res.success) {
        setResetStatus({
          error: '',
          success: res.message || 'A 6-digit OTP code has been sent to your email address.',
          loading: false,
        });
        setResetOtp('');
        setResetStep(2);
        startResendTimer();
      } else {
        setResetStatus({ error: res.message || 'Failed to send OTP code.', success: '', loading: false });
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const msg = err.data?.message || err.message || 'No account registered with this email address.';
      setResetStatus({ error: msg, success: '', loading: false });
    }
  }

  // Handle Resend OTP in Forgot Password Modal
  async function handleResendForgotOtp() {
    if (isTimerActive) return;
    await handleSendForgotOtp(null);
  }

  // Handle Forgot Password Step 2: Verify OTP
  async function handleVerifyForgotOtp(e) {
    e.preventDefault();
    if (!resetOtp || resetOtp.trim().length !== 6) {
      setResetStatus({ error: 'Please enter the 6-digit OTP code.', success: '', loading: false });
      return;
    }

    setResetStatus({ error: '', success: '', loading: true });
    try {
      const res = await api.verifyForgotOtp({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
      });

      if (res.success) {
        setResetStatus({
          error: '',
          success: 'OTP verified successfully! Please enter your new password below.',
          loading: false,
        });
        setResetStep(3);
      } else {
        setResetStatus({ error: res.message || 'Failed to verify OTP code.', success: '', loading: false });
      }
    } catch (err) {
      console.error('Verify forgot OTP error:', err);
      const msg = err.data?.message || err.message || 'Invalid or expired OTP code.';
      setResetStatus({ error: msg, success: '', loading: false });
    }
  }

  // Handle Forgot Password Step 3: Reset Password
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!newPassword) {
      setResetStatus({ error: 'Please enter a new password.', success: '', loading: false });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetStatus({ error: 'Passwords do not match.', success: '', loading: false });
      return;
    }

    if (!isResetPasswordStrong) {
      setResetStatus({
        error: 'New password must satisfy all security requirements.',
        success: '',
        loading: false,
      });
      return;
    }

    setResetStatus({ error: '', success: '', loading: true });
    try {
      const res = await api.resetPassword({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
      });

      if (res.success) {
        setResetStatus({
          error: '',
          success: 'Password reset successfully! Redirecting to sign in...',
          loading: false,
        });
        setTimeout(() => {
          setShowForgotModal(false);
          setResetStep(1);
          setResetEmail('');
          setResetOtp('');
          setNewPassword('');
          setConfirmNewPassword('');
          setResetStatus({ error: '', success: '', loading: false });
        }, 1500);
      } else {
        setResetStatus({ error: res.message || 'Failed to reset password.', success: '', loading: false });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = err.data?.message || err.message || 'Failed to reset password.';
      setResetStatus({ error: msg, success: '', loading: false });
    }
  }

  return (
    <>
      <form className="auth-form-container" onSubmit={handleSubmit} noValidate>
        <TextInput
          id="username"
          label="Username or Email Address"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username or email address"
          autoComplete="username"
          icon={UserIcon}
          error={errors.username}
          disabled={isSubmitting}
        />

        <div className="form-field-group">
          <div className="form-label-row">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</span>
            <button
              type="button"
              className="forgot-btn-link"
              onClick={() => {
                setShowForgotModal(true);
                setResetStep(1);
                setResetStatus({ error: '', success: '', loading: false });
              }}
            >
              Forgot Password?
            </button>
          </div>
          <TextInput
            id="password"
            label=""
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
        </div>

        {authError && <div className="auth-error" style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.85rem' }}>{authError}</div>}

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

      {/* Forgot Password SMTP Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="reset-modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {resetStep === 1 && 'Reset Account Password'}
                {resetStep === 2 && 'Verify Reset OTP'}
                {resetStep === 3 && 'Set New Password'}
              </h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setShowForgotModal(false)}
              >
                ✕
              </button>
            </div>

            {resetStatus.error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.84rem', marginTop: '10px' }}>
                {resetStatus.error}
              </div>
            )}
            {resetStatus.success && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.84rem', marginTop: '10px' }}>
                {resetStatus.success}
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {resetStep === 1 && (
              <form onSubmit={handleSendForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter your registered email address below. We will send a 6-digit password reset OTP via Hostinger SMTP.
                </p>
                <TextInput
                  id="reset-email"
                  label="Registered Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  icon={MailIcon}
                  disabled={resetStatus.loading}
                />
                <Button type="submit" variant="primary" block={true} loading={resetStatus.loading}>
                  Send Reset OTP Code
                </Button>
              </form>
            )}

            {/* STEP 2: Verify 6-Digit OTP */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter the 6-digit OTP code sent to: <strong style={{ color: 'var(--accent-color)' }}>{resetEmail}</strong>.
                </p>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>6-Digit OTP Code (Expires in 5m)</span>
                  <OtpInput length={6} value={resetOtp} onChange={setResetOtp} disabled={resetStatus.loading} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResendForgotOtp}
                    disabled={isTimerActive || resetStatus.loading}
                    style={{ flex: 1 }}
                  >
                    {isTimerActive ? `Resend (${timer}s)` : 'Resend OTP'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    style={{ flex: 2 }}
                    loading={resetStatus.loading}
                    disabled={resetOtp.length !== 6}
                  >
                    Verify OTP
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <TextInput
                  id="reset-new-password"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars (1 upper, 1 lower, 1 num, 1 special)"
                  icon={LockIcon}
                  showPasswordToggle={true}
                  disabled={resetStatus.loading}
                />
                <TextInput
                  id="reset-confirm-new-password"
                  label="Confirm New Password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  icon={LockIcon}
                  showPasswordToggle={true}
                  disabled={resetStatus.loading}
                />

                {/* Real-time Password Criteria Box */}
                <div className="password-criteria-box">
                  <div className="criteria-title">Password Security Requirements:</div>
                  <div className="criteria-list">
                    <div className={`criteria-item ${hasMinLength ? 'valid' : ''}`}>
                      <div className="criteria-bullet" />
                      <span>Min 8 chars</span>
                    </div>
                    <div className={`criteria-item ${hasUpper ? 'valid' : ''}`}>
                      <div className="criteria-bullet" />
                      <span>1 Uppercase (A-Z)</span>
                    </div>
                    <div className={`criteria-item ${hasLower ? 'valid' : ''}`}>
                      <div className="criteria-bullet" />
                      <span>1 Lowercase (a-z)</span>
                    </div>
                    <div className={`criteria-item ${hasNumber ? 'valid' : ''}`}>
                      <div className="criteria-bullet" />
                      <span>1 Number (0-9)</span>
                    </div>
                    <div className={`criteria-item ${hasSpecial ? 'valid' : ''}`} style={{ gridColumn: 'span 2' }}>
                      <div className="criteria-bullet" />
                      <span>1 Special char (@ $ ! % * ? & ^ # _ - + = ~)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <Button type="button" variant="secondary" onClick={() => setResetStep(2)} style={{ flex: 1 }}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" style={{ flex: 2 }} loading={resetStatus.loading}>
                    Reset Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}