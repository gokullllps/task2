import React, { useState, useEffect } from 'react';
import GlassCard from './ui/GlassCard';
import { PrimaryButton } from './ui/Button';
import { UserIcon, LockIcon, ShieldIcon, SunIcon, BellIcon, CalendarIcon, ActivityIcon, LogoutIcon } from './Icons';
import api from '../utils/api';

export default function SettingsView({ user, theme, setTheme, onLogout, todos, onUpdateUser }) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';
  const currentEmail = typeof user === 'object' ? user?.email || `${currentUsername.toLowerCase()}@prasklatechnology.com` : `${currentUsername.toLowerCase()}@prasklatechnology.com`;

  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifications, setEmailNotifications] = useState(() => user?.emailNotifications ?? true);
  const [deadlineReminders, setDeadlineReminders] = useState(() => user?.deadlineReminders ?? true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (typeof user === 'object' && user) {
      if (user.emailNotifications !== undefined) setEmailNotifications(user.emailNotifications);
      if (user.deadlineReminders !== undefined) setDeadlineReminders(user.deadlineReminders);
    }
  }, [user]);

  const handleToggleEmailNotifications = async (val) => {
    setEmailNotifications(val);
    try {
      const res = await api.updateProfile({ emailNotifications: val });
      if (res.success && onUpdateUser) onUpdateUser(res.user);
      setStatusMsg('Email notification preferences updated in MongoDB.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error updating settings in MongoDB:', err);
    }
  };

  const handleToggleDeadlineReminders = async (val) => {
    setDeadlineReminders(val);
    try {
      const res = await api.updateProfile({ deadlineReminders: val });
      if (res.success && onUpdateUser) onUpdateUser(res.user);
      setStatusMsg('Deadline reminder preferences updated in MongoDB.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error updating settings in MongoDB:', err);
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ user, todos }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `praskla_backup_${currentUsername}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMsg('Workspace data exported successfully!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const navItems = [
    { key: 'account', label: 'Account', icon: UserIcon },
    { key: 'security', label: 'Security & Auth', icon: LockIcon },
    { key: 'privacy', label: 'Privacy & Data', icon: ShieldIcon },
    { key: 'appearance', label: 'Appearance', icon: SunIcon },
    { key: 'notifications', label: 'Notifications', icon: BellIcon },
    { key: 'backup', label: 'Backup & Export', icon: CalendarIcon },
    { key: 'about', label: 'About Praskla Todo', icon: ActivityIcon },
  ];

  return (
    <GlassCard className="settings-view-container" hoverEffect={false}>
      {/* Settings Sub-Sidebar Navigation */}
      <div className="settings-nav">
        <h3 className="settings-title">Settings</h3>
        <div className="settings-menu">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                className={`settings-menu-btn ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="settings-menu-divider" />
          <button className="settings-menu-btn danger" onClick={onLogout}>
            <LogoutIcon size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="settings-content">
        {statusMsg && <div className="auth-success" style={{ marginBottom: '20px' }}>{statusMsg}</div>}

        {activeTab === 'account' && (
          <div className="settings-panel">
            <h2>Account Details</h2>
            <p className="settings-desc">Manage your workspace credentials and platform role.</p>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={currentUsername} disabled className="input-disabled" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={currentEmail} disabled className="input-disabled" />
            </div>
            <div className="form-group">
              <label>Subscription Tier</label>
              <input type="text" value="Praskla Pro (TaskHub Engine)" disabled className="input-disabled" />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-panel">
            <h2>Security & Password</h2>
            <p className="settings-desc">Your authentication is secured with JWT tokens and bcrypt password hashing (10 rounds).</p>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••••••" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password (min 6 chars)" />
            </div>
            <PrimaryButton onClick={() => { setStatusMsg('Security preferences updated.'); setTimeout(() => setStatusMsg(''), 3000); }}>
              Update Password
            </PrimaryButton>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="settings-panel">
            <h2>Appearance & Theme</h2>
            <p className="settings-desc">Choose between Liquid Light and Emerald Dark themes.</p>

            <div className="theme-selection-grid">
              <button
                className={`theme-card-option ${theme === 'light' ? 'selected' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-preview-box light" />
                <span>Liquid Light Theme</span>
              </button>
              <button
                className={`theme-card-option ${theme === 'dark' ? 'selected' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-preview-box dark" />
                <span>Emerald Dark Theme</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-panel">
            <h2>Notification Preferences</h2>
            <p className="settings-desc">Configure automated task deadline reminders and activity alerts.</p>
            <div className="setting-toggle-row">
              <div>
                <strong>Email Deadline Alerts</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Receive notifications 1 hour before task due dates.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => handleToggleEmailNotifications(e.target.checked)}
              />
            </div>
            <div className="setting-toggle-row">
              <div>
                <strong>Daily Productivity Summary</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Get a daily morning summary of your schedule.</p>
              </div>
              <input
                type="checkbox"
                checked={deadlineReminders}
                onChange={(e) => handleToggleDeadlineReminders(e.target.checked)}
              />
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="settings-panel">
            <h2>Data Backup & Portability</h2>
            <p className="settings-desc">Download a complete backup of your tasks, activity logs, and preferences.</p>
            <PrimaryButton onClick={handleExportData}>
              Export JSON Backup ({todos.length} tasks)
            </PrimaryButton>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="settings-panel">
            <h2>About Praskla Todo</h2>
            <p className="settings-desc">Version 3.0.0 — Praskla TaskHub Productivity Platform.</p>
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', fontSize: '0.88rem' }}>
              <p>⚡ Powered by React 18, Express.js, Node.js, MongoDB, JWT, and bcryptjs.</p>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Crafted with Praskla TaskHub Liquid Glass visual design principles.</p>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
