import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from './ui/GlassCard';
import CollapsiblePanel from './ui/CollapsiblePanel';
import { PrimaryButton, SecondaryButton } from './ui/Button';
import { PriorityBadge } from './ui/Badge';
import {
  PlusIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  CopyIcon,
  TrashIcon,
  TaskIcon,
} from './Icons';
import { EmptyHomeOverviewIllustration, PrioritySpotlightIllustration } from './EmptyStates';

export default function HomeView({
  todos = [],
  user,
  onNavigateToTasks,
  onAddTodo,
}) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';

  const [currentTime, setCurrentTime] = useState(new Date());

  // Quick Task Add Input State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');

  // Focus Pomodoro Timer State (25 mins default)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Scratchpad State
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem('praskla_workspace_scratchpad') || '';
  });
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro Interval Timer
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Scratchpad Persistence
  const handleScratchpadChange = (e) => {
    const text = e.target.value;
    setScratchpadText(text);
    localStorage.setItem('praskla_workspace_scratchpad', text);
  };

  const handleCopyScratchpad = () => {
    if (!scratchpadText) return;
    navigator.clipboard.writeText(scratchpadText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleClearScratchpad = () => {
    setScratchpadText('');
    localStorage.removeItem('praskla_workspace_scratchpad');
  };

  // Quick Task Creation Handler
  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    if (onAddTodo) {
      onAddTodo(quickTitle.trim(), '', { priority: quickPriority });
      setQuickTitle('');
    } else if (onNavigateToTasks) {
      onNavigateToTasks();
    }
  };

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

  const formatTimerDisplay = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      {/* Top Hero Section with Quick Task Creator and Real Workspace Snapshot */}
      <GlassCard className="welcome-hero-card" hoverEffect={false} style={{ borderRadius: '18px', padding: '22px 26px' }}>
        <div className="hero-content-left" style={{ flex: 1 }}>
          <h1 className="hero-greeting" style={{ fontSize: '1.65rem', marginBottom: '4px', lineHeight: 1.2 }}>
            {greeting}, <span className="hero-username">{currentUsername}</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            You have <strong style={{ color: 'var(--accent-color)' }}>{pendingCount} pending task{pendingCount !== 1 ? 's' : ''}</strong> scheduled in your workspace.
          </p>

          {/* Real Workspace Progress Bar */}
          <div style={{ marginTop: '14px', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Workspace Completion</span>
              <span style={{ color: 'var(--accent-color)' }}>{scorePercent}% ({completedCount} of {totalCount})</span>
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

          {/* Functional Inline Quick Task Creator */}
          <form onSubmit={handleQuickAddSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px', maxWidth: '480px' }}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <PrimaryButton type="submit" size="sm" icon={PlusIcon}>
              Add Task
            </PrimaryButton>
          </form>
        </div>

        {/* Right Column of Hero Banner: Real Workspace Snapshot */}
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
        {/* Left Column: Today's Tasks, Upcoming Priorities & Scratchpad */}
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
              <div className="empty-home-tasks" style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <EmptyHomeOverviewIllustration size={70} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)' }}>
                  All Caught Up for Today
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '380px', margin: '0 auto 12px', lineHeight: 1.4 }}>
                  Your workspace is clean. Create a task above or select a starter preset below.
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

          {/* Panel 2: Upcoming Priorities */}
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

          {/* Panel 3: Quick Workspace Scratchpad */}
          <CollapsiblePanel
            title="Workspace Scratchpad"
            action={
              <div style={{ display: 'flex', gap: '6px' }}>
                <SecondaryButton size="sm" onClick={handleCopyScratchpad}>
                  <CopyIcon size={12} /> {copiedNotice ? 'Copied' : 'Copy'}
                </SecondaryButton>
                {scratchpadText && (
                  <SecondaryButton size="sm" onClick={handleClearScratchpad}>
                    <TrashIcon size={12} /> Clear
                  </SecondaryButton>
                )}
              </div>
            }
          >
            <textarea
              className="scratchpad-textarea"
              placeholder="Jot down quick thoughts, meeting notes, or temporary reminders..."
              value={scratchpadText}
              onChange={handleScratchpadChange}
            />
          </CollapsiblePanel>
        </div>

        {/* Right Column: Metrics & Focus Timer */}
        <div className="home-grid-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Panel 1: Task Metrics with Circular Donut Gauge */}
          <CollapsiblePanel title="Task Metrics & Velocity">
            <div className="score-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', textAlign: 'center' }}>
              {/* Circular Gauge Graphic */}
              <div style={{ position: 'relative', width: '100px', height: '100px', margin: '6px 0' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-input)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * scorePercent) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{scorePercent}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Done</span>
                </div>
              </div>

              {/* Real metric breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', width: '100%', margin: '8px 0 6px', padding: '10px 6px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-color)' }}>{completedCount}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Done</span>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--warning-color)' }}>{pendingCount}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total</span>
                </div>
              </div>
            </div>
          </CollapsiblePanel>

          {/* Panel 2: Pomodoro Focus Timer */}
          <CollapsiblePanel title="Focus Timer (Pomodoro)">
            <div className="focus-timer-card">
              <div className="timer-display">{formatTimerDisplay(timerSeconds)}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <PrimaryButton
                  size="sm"
                  icon={timerRunning ? PauseIcon : PlayIcon}
                  onClick={() => setTimerRunning(!timerRunning)}
                >
                  {timerRunning ? 'Pause' : 'Start Focus'}
                </PrimaryButton>
                <SecondaryButton
                  size="sm"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                >
                  <RotateCcwIcon size={14} /> Reset
                </SecondaryButton>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                25-minute deep focus countdown timer.
              </span>
            </div>
          </CollapsiblePanel>
        </div>
      </div>
    </div>
  );
}
