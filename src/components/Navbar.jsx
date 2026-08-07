import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import AccountSwitcher from './AccountSwitcher';
import { SidebarIcon, BellIcon, CheckIcon, AwardIcon, FlameIcon, ClockIcon } from './Icons';

function calculateDynamicStreak(todos = []) {
  const completedTodos = todos.filter((t) => t.completed);
  if (completedTodos.length === 0) return 0;

  const dateSet = new Set();
  completedTodos.forEach((t) => {
    const rawDate = t.updatedAt || t.createdAt;
    if (rawDate) {
      try {
        const formatted = new Date(rawDate).toISOString().split('T')[0];
        dateSet.add(formatted);
      } catch (err) {
        // ignore invalid dates
      }
    }
  });

  if (dateSet.size === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let curr = new Date();

  if (!dateSet.has(todayStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const dStr = curr.toISOString().split('T')[0];
    if (dateSet.has(dStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export default function Navbar({
  onLogout,
  theme,
  setTheme,
  user,
  todos = [],
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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const completedCount = (todos || []).filter((t) => t.completed).length;
  const totalCount = (todos || []).length;
  const scorePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const streakDays = calculateDynamicStreak(todos);

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
          {/* Live Digital Clock Chip */}
          <div className="navbar-clock-chip">
            <ClockIcon size={14} />
            <span>{formattedTime}</span>
          </div>

          {/* Dynamic Productivity Achievement Badges */}
          <div className="navbar-achievements-group">
            <div className="navbar-achievement-badge gold" title={`Task Master: ${completedCount} completed tasks`}>
              <AwardIcon size={15} />
              <span className="badge-value">{completedCount}</span>
            </div>

            <div className="navbar-achievement-badge flame" title={`Focus Streak: ${streakDays} day streak`}>
              <FlameIcon size={15} />
              <span className="badge-value">{streakDays}d</span>
            </div>

            <div className="navbar-achievement-badge green" title={`Efficiency Rating: ${scorePercent}% completed`}>
              <CheckIcon size={15} />
              <span className="badge-value">{scorePercent}%</span>
            </div>
          </div>

          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}