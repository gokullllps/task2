import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Avatar from './ui/Avatar';
import GlassCard from './ui/GlassCard';
import { PrimaryButton, SecondaryButton, IconButton } from './ui/Button';
import { TextInput } from './ui/Input';
import { getSavedAccounts, switchAccountSession, removeSavedAccount, validateCredentials, registerUser } from '../utils/auth';
import { CheckIcon, PlusIcon, LogoutIcon, TrashIcon, CloseIcon } from './Icons';

export default function AccountSwitcher({ currentUser, onSwitchUser, onLogout, onAddAccount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Tab State inside Add Account Modal: 'login' | 'register'
  const [modalTab, setModalTab] = useState('login');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const currentUsername = typeof currentUser === 'string' ? currentUser : currentUser?.username || 'User';
  const currentEmail = currentUser?.email || `${currentUsername.toLowerCase()}@praskla.com`;

  const savedAccounts = getSavedAccounts();
  const otherAccounts = savedAccounts.filter(
    (acc) => acc.username.toLowerCase() !== currentUsername.toLowerCase()
  );

  // Keyboard ESC Listener to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddAccountModal(false);
        setShowManageModal(false);
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectAccount = (acc) => {
    const switchedUser = switchAccountSession(acc.id || acc.username);
    setIsOpen(false);
    setShowManageModal(false);
    if (onSwitchUser && switchedUser) {
      onSwitchUser(switchedUser);
    }
  };

  const handleRemoveAccount = (e, acc) => {
    e.stopPropagation();
    const remainingUser = removeSavedAccount(acc.id || acc.username);
    if (onSwitchUser && remainingUser) {
      onSwitchUser(remainingUser);
    } else {
      window.location.reload();
    }
  };

  // Open Sign In Form Modal (+ Add Existing Account)
  const handleOpenLoginModal = () => {
    setIsOpen(false);
    setModalTab('login');
    setLoginError('');
    setShowAddAccountModal(true);
  };

  // Handle Sign In Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;

    try {
      setLoginLoading(true);
      setLoginError('');

      const res = await validateCredentials(loginIdentifier.trim(), loginPassword);
      if (res.valid && res.user) {
        setShowAddAccountModal(false);
        setLoginIdentifier('');
        setLoginPassword('');
        setIsOpen(false);
        if (onSwitchUser) {
          onSwitchUser(res.user);
        }
      } else {
        setLoginError(res.error || 'Failed to authenticate account');
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) return;

    try {
      setRegLoading(true);
      setRegError('');

      const res = await registerUser({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      if (res.success && res.user) {
        setShowAddAccountModal(false);
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setIsOpen(false);
        if (onSwitchUser) {
          onSwitchUser(res.user);
        }
      } else {
        setRegError(res.error || 'Registration failed');
      }
    } catch (err) {
      setRegError(err.message || 'Registration error');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Profile Avatar Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        title="Account Switcher"
        aria-label="Account Switcher"
      >
        <Avatar username={currentUsername} size="md" showStatus />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '320px',
            padding: '16px',
            zIndex: 150,
            boxShadow: 'var(--shadow-strong)',
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          {/* Current Account Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
            <Avatar username={currentUsername} size="lg" showStatus />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 800 }}>●</span>
                <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {currentUsername}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentEmail}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 700, marginTop: '2px' }}>
                (Current Account)
              </span>
            </div>
          </div>

          {/* Saved Accounts Section */}
          <div style={{ margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Saved Accounts ({otherAccounts.length})
              </span>
              {savedAccounts.length > 0 && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowManageModal(true);
                  }}
                  style={{ fontSize: '0.74rem', color: 'var(--accent-color)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Manage Accounts
                </button>
              )}
            </div>

            {otherAccounts.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                No saved accounts
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {otherAccounts.map((acc) => (
                  <div
                    key={acc.id || acc.username}
                    onClick={() => handleSelectAccount(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 800 }}>○</span>
                      <Avatar username={acc.username} size="sm" />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>{acc.username}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{acc.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleRemoveAccount(e, acc)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger-color)', opacity: 0.6, cursor: 'pointer', padding: '4px' }}
                      title="Remove account from device"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Menu Controls */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* + Add Existing Account */}
            <button
              onClick={handleOpenLoginModal}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <PlusIcon size={16} style={{ color: 'var(--accent-color)' }} />
              <span>+ Add Existing Account</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (onLogout) onLogout();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger-color)',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <LogoutIcon size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Viewport Centered Authentication Modal Mounted via React Portal */}
      {showAddAccountModal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddAccountModal(false);
            }}
          >
            <div className="modal-content-wrapper">
              <GlassCard
                hoverEffect={false}
                style={{
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-strong)',
                  border: '1px solid var(--border-color)',
                  margin: 'auto',
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {modalTab === 'login' ? 'Add Existing Account' : 'Create New Account'}
                </h3>
                <IconButton icon={CloseIcon} onClick={() => setShowAddAccountModal(false)} title="Close (ESC)" />
              </div>

              {/* Modal Navigation Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('login')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: modalTab === 'login' ? 'var(--accent-color)' : 'transparent',
                    color: modalTab === 'login' ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign In Existing
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('register')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: modalTab === 'register' ? 'var(--accent-color)' : 'transparent',
                    color: modalTab === 'register' ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Register New
                </button>
              </div>

              {/* TAB 1: SIGN IN (ADD EXISTING ACCOUNT) */}
              {modalTab === 'login' && (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {loginError && <div className="auth-error">{loginError}</div>}
                  <TextInput
                    label="Username or Email"
                    placeholder="Enter username or email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Password"
                    type="password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <PrimaryButton type="submit" block disabled={loginLoading}>
                      {loginLoading ? 'Signing in...' : 'Sign In & Save'}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setShowAddAccountModal(false)}>Cancel</SecondaryButton>
                  </div>
                </form>
              )}

              {/* TAB 2: REGISTER (CREATE NEW ACCOUNT) */}
              {modalTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {regError && <div className="auth-error">{regError}</div>}
                  <TextInput
                    label="Username"
                    placeholder="e.g. rahul"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Email Address"
                    type="email"
                    placeholder="rahul@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Password"
                    type="password"
                    placeholder="••••••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <PrimaryButton type="submit" block disabled={regLoading}>
                      {regLoading ? 'Registering...' : 'Create & Save'}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setShowAddAccountModal(false)}>Cancel</SecondaryButton>
                  </div>
                </form>
              )}
            </GlassCard>
            </div>
          </div>,
          document.body
        )}

      {/* Viewport Centered Manage Accounts Modal Mounted via React Portal */}
      {showManageModal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowManageModal(false);
            }}
          >
            <div className="modal-content-wrapper">
              <GlassCard
                hoverEffect={false}
                style={{
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-strong)',
                  border: '1px solid var(--border-color)',
                  margin: 'auto',
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Manage Accounts</h3>
                <IconButton icon={CloseIcon} onClick={() => setShowManageModal(false)} title="Close (ESC)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {savedAccounts.map((acc) => {
                  const isActive = acc.username.toLowerCase() === currentUsername.toLowerCase();
                  return (
                    <div
                      key={acc.id || acc.username}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-input)',
                        border: isActive ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '1rem', fontWeight: 800 }}>
                          {isActive ? '●' : '○'}
                        </span>
                        <Avatar username={acc.username} size="md" />
                        <div>
                          <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 800 }}>{acc.username}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{acc.email}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isActive ? (
                          <span style={{ fontSize: '0.74rem', color: 'var(--accent-color)', fontWeight: 800, background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                            Active
                          </span>
                        ) : (
                          <>
                            <SecondaryButton size="sm" onClick={() => handleSelectAccount(acc)}>
                              Switch
                            </SecondaryButton>
                            <IconButton icon={TrashIcon} danger onClick={(e) => handleRemoveAccount(e, acc)} title="Remove account from device" ariaLabel="Remove account" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SecondaryButton onClick={() => setShowManageModal(false)}>Done</SecondaryButton>
              </div>
            </GlassCard>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
