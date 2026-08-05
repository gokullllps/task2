import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from './ui/GlassCard';
import StatCard from './ui/StatCard';
import { PrimaryButton, SecondaryButton } from './ui/Button';
import { PriorityBadge } from './ui/Badge';
import { TaskIcon, CheckIcon, ClockIcon, FlameIcon, CalendarIcon, PlusIcon, AwardIcon, SunIcon, BellIcon } from './Icons';

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
    <div className="home-view-container">
      {/* Welcome Hero Banner */}
      <GlassCard className="welcome-hero-card" hoverEffect={false}>
        <div className="hero-content-left">
          <div className="hero-badge">
            <span className="hero-pulse-dot" />
            <span>Praskla Todo Active</span>
          </div>
          <h1 className="hero-greeting">
            {greeting}, <span className="hero-username">{currentUsername}</span>
          </h1>
          <p className="hero-subtitle">
            You have <strong style={{ color: 'var(--accent-color)' }}>{pendingCount} pending task{pendingCount !== 1 ? 's' : ''}</strong> scheduled for today.
          </p>

          <div className="hero-quick-actions" style={{ display: 'flex', gap: '12px' }}>
            <PrimaryButton icon={PlusIcon} onClick={onNavigateToTasks}>
              Go to Task Workspace
            </PrimaryButton>
            <SecondaryButton icon={BellIcon} onClick={onNavigateToActivity}>
              View Audit Logs
            </SecondaryButton>
          </div>
        </div>

        <div className="hero-clock-widget">
          <div className="hero-time-display">{formattedTimeStr}</div>
          <div className="hero-date-display">{formattedDate}</div>
          <div className="hero-weather-badge">
            <SunIcon size={14} />
            <span>22°C Clear • Deep Focus Environment</span>
          </div>
        </div>
      </GlassCard>

      {/* Quick Statistics Grid */}
      <section className="home-metrics-grid">
        <StatCard label="Total Workspace Tasks" value={totalCount} icon={TaskIcon} variant="accent" />
        <StatCard label="Completed Tasks" value={completedCount} icon={CheckIcon} variant="success" />
        <StatCard label="Pending Action Items" value={pendingCount} icon={ClockIcon} variant="warning" />
        <StatCard label="Productivity Velocity" value={`${scorePercent}%`} icon={FlameIcon} variant="flame" progress={scorePercent} />
      </section>

      {/* Clean Home Main Grid */}
      <div className="home-main-grid">
        {/* Left Column: Today's Tasks Overview */}
        <div className="home-grid-left">
          <GlassCard className="home-card" hoverEffect={false}>
            <div className="home-card-header">
              <div className="home-card-title">
                <CalendarIcon size={18} />
                <span>Today's Task Overview</span>
              </div>
              <SecondaryButton size="sm" onClick={onNavigateToTasks}>
                View All ({totalCount})
              </SecondaryButton>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="empty-home-tasks" style={{ padding: '32px 16px', textAlign: 'center' }}>
                <CheckIcon size={36} style={{ color: 'var(--accent-color)', opacity: 0.6, marginBottom: '8px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  All caught up! No pending tasks in your workspace.
                </p>
              </div>
            ) : (
              <div className="home-task-list">
                {todaysTasks.map((todo) => (
                  <div key={todo.id || todo._id} className={`home-task-item ${todo.completed ? 'completed' : ''}`}>
                    <div className="home-task-bullet" />
                    <div className="home-task-info">
                      <span className="home-task-title">{todo.title}</span>
                      {todo.description && <span className="home-task-desc">{todo.description}</span>}
                    </div>
                    <PriorityBadge priority={todo.priority} />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Upcoming High-Priority Tasks Card */}
          <GlassCard className="home-card" hoverEffect={false}>
            <div className="home-card-header">
              <div className="home-card-title">
                <ClockIcon size={18} />
                <span>Upcoming Priorities</span>
              </div>
            </div>
            {upcomingTasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', padding: '12px 0' }}>
                No upcoming high priority deadlines.
              </p>
            ) : (
              <div className="home-task-list">
                {upcomingTasks.map((todo) => (
                  <div key={todo.id || todo._id} className="home-task-item">
                    <div className="home-task-bullet" style={{ background: 'var(--warning-color)' }} />
                    <div className="home-task-info">
                      <span className="home-task-title">{todo.title}</span>
                    </div>
                    <PriorityBadge priority={todo.priority || 'high'} />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Productivity Score Gauge & Notifications Preview */}
        <div className="home-grid-right">
          <GlassCard className="home-card score-card" hoverEffect={false}>
            <div className="home-card-title" style={{ marginBottom: '16px', justifyContent: 'center' }}>
              <AwardIcon size={18} />
              <span>Productivity Score</span>
            </div>

            <div className="radial-score-wrapper">
              <svg width="120" height="120" viewBox="0 0 120 120" className="radial-svg">
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
                <span>{scorePercent}%</span>
                <small>Efficiency</small>
              </div>
            </div>
          </GlassCard>

          {/* System Notifications Preview */}
          <GlassCard className="home-card" hoverEffect={false}>
            <div className="home-card-title">
              <BellIcon size={18} />
              <span>Workspace Alerts</span>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>System</span>
                <span style={{ color: 'var(--text-secondary)' }}>Praskla Todo Engine is active and synced.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--warning-color)', fontWeight: 700 }}>Security</span>
                <span style={{ color: 'var(--text-secondary)' }}>JWT Token session verified.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
