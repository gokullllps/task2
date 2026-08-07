import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from './ui/GlassCard';
import CollapsiblePanel from './ui/CollapsiblePanel';
import { PrimaryButton, SecondaryButton } from './ui/Button';
import { PriorityBadge } from './ui/Badge';
import { PlusIcon, SunIcon, BellIcon } from './Icons';

export default function HomeView({ todos, user, onNavigateToTasks, onNavigateToActivity }) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, [currentTime]);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTimeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const scorePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const todaysTasks = useMemo(() => {
    return todos.slice(0, 5);
  }, [todos]);

  const upcomingTasks = useMemo(() => {
    return todos.filter((t) => !t.completed).slice(0, 4);
  }, [todos]);

  return (
    <div className="home-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Hero Section with Progress Indicator */}
      <GlassCard className="welcome-hero-card" hoverEffect={false} style={{ borderRadius: '18px', padding: '22px 26px' }}>
        <div className="hero-content-left" style={{ flex: 1 }}>
          <h1 className="hero-greeting" style={{ fontSize: '1.65rem', marginBottom: '4px', lineHeight: 1.2 }}>
            {greeting}, <span className="hero-username">{currentUsername}</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            You have <strong style={{ color: 'var(--accent-color)' }}>{pendingCount} pending task{pendingCount !== 1 ? 's' : ''}</strong> scheduled for today.
          </p>

          {/* Structured Workspace Progress Bar */}
          <div style={{ marginTop: '14px', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Workspace Progress</span>
              <span style={{ color: 'var(--accent-color)' }}>{completedCount} of {totalCount} completed</span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--bg-input)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div
                style={{
                  width: `${scorePercent}%`,
                  height: '100%',
                  background: 'var(--accent-gradient)',
                  borderRadius: '9999px',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          <div className="hero-quick-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <PrimaryButton icon={PlusIcon} onClick={onNavigateToTasks}>
              Go to Task Workspace
            </PrimaryButton>
            <SecondaryButton icon={BellIcon} onClick={onNavigateToActivity}>
              View Audit Logs
            </SecondaryButton>
          </div>
        </div>

        <div className="hero-clock-widget">
          <div className="hero-time-display" style={{ fontSize: '1.65rem' }}>{formattedTimeStr}</div>
          <div className="hero-date-display" style={{ fontSize: '0.82rem' }}>{formattedDate}</div>
          <div className="hero-weather-badge" style={{ marginTop: '10px' }}>
            <SunIcon size={14} />
            <span>22°C Clear • Deep Focus Environment</span>
          </div>
        </div>
      </GlassCard>

      {/* Main Dashboard Grid */}
      <div className="home-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
        {/* Left Column: Today's Tasks & Upcoming Priorities */}
        <div className="home-grid-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Panel 1: Today's Task Overview */}
          <CollapsiblePanel
            title="Today's Task Overview"
            action={
              <SecondaryButton size="sm" onClick={onNavigateToTasks}>
                View All ({totalCount})
              </SecondaryButton>
            }
          >
            {todaysTasks.length === 0 ? (
              <div className="empty-home-tasks" style={{ padding: '20px 14px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  All caught up! No pending tasks in your workspace.
                </p>
              </div>
            ) : (
              <div className="home-task-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todaysTasks.map((todo) => (
                  <div key={todo.id || todo._id} className={`home-task-item ${todo.completed ? 'completed' : ''}`}>
                    <div className="home-task-bullet" />
                    <div className="home-task-info">
                      <span className="home-task-title">{todo.title}</span>
                      {todo.description && <span className="home-task-desc">{todo.description}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                      </span>
                      <PriorityBadge priority={todo.priority} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsiblePanel>

          {/* Panel 2: Upcoming Priorities */}
          <CollapsiblePanel title="Upcoming Priorities">
            {upcomingTasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', padding: '6px 0' }}>
                No upcoming high priority deadlines.
              </p>
            ) : (
              <div className="home-task-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingTasks.map((todo) => (
                  <div key={todo.id || todo._id} className="home-task-item">
                    <div className="home-task-bullet" style={{ background: 'var(--warning-color)' }} />
                    <div className="home-task-info">
                      <span className="home-task-title">{todo.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Urgent</span>
                      <PriorityBadge priority={todo.priority || 'high'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsiblePanel>
        </div>

        {/* Right Column: Productivity Score & Workspace Alerts */}
        <div className="home-grid-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Panel 3: Productivity Score */}
          <CollapsiblePanel title="Productivity Score">
            <div className="score-card-body" style={{ textAlign: 'center', padding: '6px 0' }}>
              <div className="radial-score-wrapper" style={{ margin: '0 auto 10px', width: '90px', height: '90px' }}>
                <svg width="90" height="90" viewBox="0 0 120 120" className="radial-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeWidth="10"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (314 * scorePercent) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div className="score-percentage-text">
                  <span style={{ fontSize: '1.25rem' }}>{scorePercent}%</span>
                  <small style={{ fontSize: '0.68rem' }}>Efficiency</small>
                </div>
              </div>

              {/* High-density metric breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', margin: '10px 0 6px', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 800, color: 'var(--accent-color)' }}>{completedCount}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Done</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 800, color: 'var(--warning-color)' }}>{pendingCount}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</span>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Completion velocity active across workspace.
              </p>
            </div>
          </CollapsiblePanel>

          {/* Panel 4: Workspace Alerts */}
          <CollapsiblePanel title="Workspace Alerts">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Praskla Todo Engine synced.</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 700 }}>Live</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning-color)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>JWT Token session verified.</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secured</span>
              </div>
            </div>
          </CollapsiblePanel>
        </div>
      </div>
    </div>
  );
}

