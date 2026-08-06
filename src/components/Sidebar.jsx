import React from 'react';
import BrandLogo from './BrandLogo';
import Avatar from './ui/Avatar';
import { HomeIcon, TaskIcon, CalendarIcon, ActivityIcon, UsersIcon, UserIcon, SettingsIcon, LogoutIcon, CloseIcon } from './Icons';
import { getUserAvatar } from '../utils/avatar';

export default function Sidebar({
  user,
  onLogout,
  currentView,
  onViewChange,
  isOpen,
  onClose,
  totalCount,
}) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';
  const currentEmail = typeof user === 'object' ? user?.email || `${currentUsername.toLowerCase()}@aether.io` : `${currentUsername.toLowerCase()}@aether.io`;
  const avatarUrl = getUserAvatar(currentUsername);

  const mainNav = [
    { key: 'home', label: 'Home Dashboard', icon: HomeIcon },
    { key: 'tasks', label: 'Tasks Workspace', icon: TaskIcon, badge: totalCount },
    { key: 'calendar', label: 'Calendar Schedule', icon: CalendarIcon },
    { key: 'activity', label: 'Activity Timeline', icon: ActivityIcon },
    { key: 'family', label: 'Family / Team', icon: UsersIcon },
    { key: 'profile', label: 'My Profile', icon: UserIcon },
    { key: 'settings', label: 'Platform Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <BrandLogo size={32} />
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <CloseIcon size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <span className="sidebar-section-title">Navigation</span>
            {mainNav.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onViewChange(item.key);
                    onClose && onClose();
                  }}
                >
                  <div className="nav-icon-wrapper">
                    {isActive && <div className="nav-active-ring" />}
                    <IconComponent size={18} />
                  </div>
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Profile Card with Zero Text Overlap & Ellipsis Truncation */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user-card"
            onClick={() => onViewChange('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <Avatar username={currentUsername} src={avatarUrl} size="sm" />
            <div
              className="user-details"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <span
                className="user-name"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentUsername}
              </span>
              <span
                className="user-email"
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentEmail}
              </span>
            </div>
          </div>

          <button className="sidebar-logout-btn" onClick={onLogout} title="Sign Out">
            <LogoutIcon size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
