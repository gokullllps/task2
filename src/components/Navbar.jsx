import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import AccountSwitcher from './AccountSwitcher';
import { SidebarIcon, BellIcon, CheckIcon } from './Icons';

export default function Navbar({
  onLogout,
  theme,
  setTheme,
  user,
  currentView,
  onOpenMobileMenu,
  onSwitchUser,
  onAddAccount,
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const pageTitles = {
    home: 'Home Overview',
    tasks: 'Tasks Workspace',
    activity: 'Activity & Audit Logs',
    family: 'Family Workspace',
    profile: 'User Profile',
    settings: 'Platform Settings',
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button
            className="mobile-menu-btn"
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
          >
            <SidebarIcon size={20} />
          </button>
          <div className="navbar-title-group">
            <h1 className="navbar-page-title">{pageTitles[currentView] || 'Praskla Todo'}</h1>
            <span className="navbar-date">{currentDate}</span>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Notifications Bell Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-icon"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              title="Notifications"
              aria-label="Notifications"
              style={{ position: 'relative' }}
            >
              <BellIcon size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--danger-color)',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-card)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotificationsDropdown && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  padding: '16px',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-strong)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 800 }}>Workspace Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      style={{ fontSize: '0.76rem', color: 'var(--accent-color)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    No notifications right now.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => onMarkNotificationRead(n._id)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          background: n.read ? 'transparent' : 'var(--accent-soft)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: n.read ? 400 : 700 }}>
                          {n.message}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <AccountSwitcher
            currentUser={user}
            onSwitchUser={onSwitchUser}
            onLogout={onLogout}
            onAddAccount={onAddAccount}
          />

          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}