import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from './ui/GlassCard';
import CollapsiblePanel from './ui/CollapsiblePanel';
import { PrimaryButton, SecondaryButton } from './ui/Button';
import { PriorityBadge } from './ui/Badge';
import { PlusIcon } from './Icons';
import { EmptyHomeOverviewIllustration, PrioritySpotlightIllustration } from './EmptyStates';

export default function HomeView({
  todos = [],
  user,
  onNavigateToTasks,
  onAddTodo,
}) {
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

  // Real Calculated Metrics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = todos.filter((t) => !t.completed && t.priority === 'high').length;
  const scorePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todaysTasks = useMemo(() => {
    return todos.slice(0, 5);
  }, [todos]);

  const upcomingTasks = useMemo(() => {
    return todos.filter((t) => !t.completed && t.priority === 'high').slice(0, 4);
  }, [todos]);

  // Preset tasks starter helper
  const handleAddPresetTask = (title, description, priority = 'medium') => {
    if (onAddTodo) {
      onAddTodo(title, description, { priority });
    } else if (onNavigateToTasks) {
      onNavigateToTasks();
    }
  };

  return (
    <div className="home-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Hero Banner with Workspace Progress and Workspace Realtime Snapshot */}
      <GlassCard className="welcome-hero-card" hoverEffect={false} style={{ borderRadius: '18px', padding: '22px 26px' }}>
        <div className="hero-content-left" style={{ flex: 1 }}>
          <h1 className="hero-greeting" style={{ fontSize: '1.65rem', marginBottom: '4px', lineHeight: 1.2 }}>
            {greeting}, <span className="hero-username">{currentUsername}</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            You have <strong style={{ color: 'var(--accent-color)' }}>{pendingCount} pending task{pendingCount !== 1 ? 's' : ''}</strong> scheduled for today.
          </p>

          {/* Real Workspace Progress Bar */}
          <div style={{ marginTop: '14px', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Workspace Progress</span>
              <span style={{ color: 'var(--accent-color)' }}>{completedCount} of {totalCount} completed</span>
            </div>
            <div style={{ width: '100%', height: '7px', borderRadius: '9999px', background: 'var(--bg-input)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
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
              Create Task
            </PrimaryButton>
          </div>
        </div>

        {/* Right Side of Hero Banner: Workspace Realtime Snapshot */}
        <div className="hero-right-widget">
          <div className="hero-pulse-header">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Workspace Realtime Snapshot</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Completed Tasks</span>
              <strong style={{ color: 'var(--accent-color)' }}>{completedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>High Priority Pending</span>
              <strong style={{ color: highPriorityCount > 0 ? 'var(--warning-color)' : 'var(--text-muted)' }}>{highPriorityCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Total Workspace Items</span>
              <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scorePercent === 100 && totalCount > 0 ? '#10b981' : 'var(--accent-color)' }}>
              {totalCount === 0 ? 'Ready for Setup' : scorePercent === 100 ? 'All Tasks Complete' : 'In Progress'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Main Dashboard Grid */}
      <div className="home-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
        {/* Left Column: Today's Task Overview */}
        <div className="home-grid-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CollapsiblePanel
            title="Today's Task Overview"
            action={
              <SecondaryButton size="sm" onClick={onNavigateToTasks}>
                View All ({totalCount})
              </SecondaryButton>
            }
          >
            {todaysTasks.length === 0 ? (
              <div className="empty-home-tasks" style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <EmptyHomeOverviewIllustration size={70} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)' }}>
                  All Caught Up for Today
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '380px', margin: '0 auto 12px', lineHeight: 1.4 }}>
                  Your workspace is clean. Click Create Task above or select a starter preset below.
                </p>

                {/* 1-Click Starter Presets */}
                <div className="preset-pills-group">
                  <button className="preset-pill-btn" onClick={() => handleAddPresetTask('Plan Weekly Goals', 'Outline top priorities for the week ahead', 'high')}>
                    <PlusIcon size={14} /> Plan Weekly Goals
                  </button>
                  <button className="preset-pill-btn" onClick={() => handleAddPresetTask('Team Sync & Status', 'Sync updates with family or teammates', 'medium')}>
                    <PlusIcon size={14} /> Team Sync
                  </button>
                  <button className="preset-pill-btn" onClick={() => handleAddPresetTask('Review Workspace Notes', 'Organize tasks and prioritize pending items', 'low')}>
                    <PlusIcon size={14} /> Review Notes
                  </button>
                </div>
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
        </div>

        {/* Right Column: Upcoming Priorities */}
        <div className="home-grid-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CollapsiblePanel title="Upcoming Priorities">
            {upcomingTasks.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 10px' }}>
                <PrioritySpotlightIllustration size={50} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                    No High-Priority Bottlenecks
                  </span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
                    Tasks flagged with High Priority will appear in this spotlight section.
                  </p>
                </div>
                <SecondaryButton size="sm" onClick={onNavigateToTasks}>
                  Manage Tasks
                </SecondaryButton>
              </div>
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
      </div>
    </div>
  );
}
