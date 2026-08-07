import React, { useState, useMemo } from 'react';
import GlassCard from './ui/GlassCard';
import Avatar from './ui/Avatar';
import { PrimaryButton, SecondaryButton, IconButton } from './ui/Button';
import { TextInput, SearchInput } from './ui/Input';
import PremiumSelect from './ui/Select';
import { Chip } from './ui/Badge';
import {
  CalendarIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  EditIcon,
  CloseIcon,
  ClockIcon,
  FilterIcon,
  UserIcon,
} from './Icons';

export default function CalendarView({
  todos = [],
  familyMembers = [],
  user,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
}) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'

  // Filter State
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'my' | 'family'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Panels State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);

  // Form State for New Task
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignedTo, setNewAssignedTo] = useState('Unassigned');
  const [newDueDate, setNewDueDate] = useState('');
  const [formError, setFormError] = useState('');

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editAssignedTo, setEditAssignedTo] = useState('Unassigned');
  const [editDueDate, setEditDueDate] = useState('');

  // Priority Options for PremiumSelect
  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  // Assign Options for PremiumSelect
  const assignOptions = useMemo(() => {
    const opts = [{ value: 'Unassigned', label: 'Unassigned' }];
    familyMembers.forEach((member) => {
      opts.push({
        value: member.name,
        label: `${member.name} (${member.role})`,
      });
    });
    return opts;
  }, [familyMembers]);

  // Helper: Format Date YYYY-MM-DD
  const formatDateIso = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayIso = formatDateIso(new Date());

  // Filter Todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Search term filter
      const searchMatch =
        (todo.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.assignedToName || todo.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Source Filter
      if (sourceFilter === 'my') {
        const isAssignedToMe = (todo.assignedToName || todo.assignedTo || '').toLowerCase().includes(currentUsername.toLowerCase());
        const isCreatedByMe = (todo.createdBy || '').toLowerCase().includes(currentUsername.toLowerCase());
        if (!isAssignedToMe && !isCreatedByMe) return false;
      } else if (sourceFilter === 'family') {
        const isAssignedOther = todo.assignedToName && todo.assignedToName.toLowerCase() !== currentUsername.toLowerCase();
        if (!isAssignedOther) return false;
      }

      // Status Filter
      if (statusFilter === 'pending' && todo.completed) return false;
      if (statusFilter === 'completed' && !todo.completed) return false;

      // Priority Filter
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

      return true;
    });
  }, [todos, searchTerm, sourceFilter, statusFilter, priorityFilter, currentUsername]);

  // Map Todos by Date String YYYY-MM-DD
  const todosByDate = useMemo(() => {
    const map = {};
    filteredTodos.forEach((todo) => {
      const dateKey = todo.dueDate ? todo.dueDate.split('T')[0] : todayIso;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(todo);
    });
    return map;
  }, [filteredTodos, todayIso]);

  // Navigation Handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open Create Modal on Date Click
  const handleDateClick = (dateIso) => {
    setSelectedDate(dateIso);
    setNewDueDate(dateIso);
    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
    setNewAssignedTo('Unassigned');
    setFormError('');
    setShowCreateModal(true);
  };

  // Handle Create Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Task title is required.');
      return;
    }

    const selectedMember = familyMembers.find((m) => m.name === newAssignedTo);
    onAddTodo(newTitle.trim(), newDescription.trim(), {
      priority: newPriority,
      assignedToName: newAssignedTo,
      assignedToMember: selectedMember ? selectedMember._id || selectedMember.id : null,
      dueDate: newDueDate || selectedDate || todayIso,
    });

    setShowCreateModal(false);
  };

  // Drag & Drop Rescheduling Handler
  const handleDragStart = (e, todo) => {
    e.dataTransfer.setData('text/plain', todo._id || todo.id);
  };

  const handleDropOnDate = (e, dateIso) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onUpdateTodo) {
      onUpdateTodo(taskId, { dueDate: dateIso });
    }
  };

  // Event Details Modal & Actions
  const handleSelectTask = (todo) => {
    setSelectedTask(todo);
    setIsEditingTask(false);
    setEditTitle(todo.title || '');
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority || 'medium');
    setEditAssignedTo(todo.assignedToName || 'Unassigned');
    setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : todayIso);
  };

  const handleSaveTaskEdit = (e) => {
    e.preventDefault();
    if (!selectedTask || !editTitle.trim()) return;

    const taskId = selectedTask._id || selectedTask.id;
    const selectedMember = familyMembers.find((m) => m.name === editAssignedTo);

    onUpdateTodo(taskId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      assignedToName: editAssignedTo,
      assignedToMember: selectedMember ? selectedMember._id || selectedMember.id : null,
      dueDate: editDueDate,
    });

    setSelectedTask(null);
    setIsEditingTask(false);
  };

  // Color Coding Helper function for Task Events
  const getEventBadgeStyle = (todo) => {
    if (todo.completed) {
      return {
        background: 'var(--success-soft)',
        border: '1px solid var(--success-color)',
        color: 'var(--success-color)',
      };
    }

    const todoDueDate = todo.dueDate ? todo.dueDate.split('T')[0] : '';
    if (todoDueDate && todoDueDate < todayIso) {
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid #ef4444',
        color: '#ef4444',
      };
    }

    if (todo.assignedToName && todo.assignedToName.toLowerCase() !== currentUsername.toLowerCase() && todo.assignedToName !== 'Unassigned') {
      return {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid #3b82f6',
        color: '#3b82f6',
      };
    }

    return {
      background: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid #f59e0b',
      color: '#f59e0b',
    };
  };

  // Compute Month Days Grid
  const monthDaysGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: prevDate,
        dateIso: formatDateIso(prevDate),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      days.push({
        date: currDate,
        dateIso: formatDateIso(currDate),
        isCurrentMonth: true,
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let n = 1; n <= remainingCells; n++) {
      const nextDate = new Date(year, month + 1, n);
      days.push({
        date: nextDate,
        dateIso: formatDateIso(nextDate),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Compute Week Days Grid
  const weekDaysGrid = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const diffToSunday = d.getDate() - dayOfWeek;
    
    const sunday = new Date(d.setDate(diffToSunday));
    const days = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + i);
      days.push({
        date: dayDate,
        dateIso: formatDateIso(dayDate),
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const headerTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = monthNames[currentDate.getMonth()];
    if (viewMode === 'month') return `${month} ${year}`;
    if (viewMode === 'week') return `Week of ${month} ${currentDate.getDate()}, ${year}`;
    return `${month} ${currentDate.getDate()}, ${year}`;
  }, [currentDate, viewMode]);

  return (
    <div className="calendar-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header Card */}
      <GlassCard hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={28} style={{ color: 'var(--accent-color)' }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{headerTitle}</h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {filteredTodos.length} Scheduled Task{filteredTodos.length !== 1 ? 's' : ''} in Calendar View
              </p>
            </div>
          </div>

          {/* Controls & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Prev / Today / Next Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={handlePrev}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
                title="Previous"
              >
                ‹ Prev
              </button>
              <button
                onClick={handleToday}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'var(--accent-color)', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Today
              </button>
              <button
                onClick={handleNext}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
                title="Next"
              >
                Next ›
              </button>
            </div>

            {/* View Mode Switcher */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'month' ? 'var(--accent-color)' : 'transparent',
                  color: viewMode === 'month' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'week' ? 'var(--accent-color)' : 'transparent',
                  color: viewMode === 'week' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'day' ? 'var(--accent-color)' : 'transparent',
                  color: viewMode === 'day' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Day
              </button>
            </div>

            <PrimaryButton icon={PlusIcon} onClick={() => handleDateClick(todayIso)}>
              New Task
            </PrimaryButton>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ minWidth: '240px', flex: 1 }}>
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Filter calendar tasks..." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Chip active={sourceFilter === 'all'} onClick={() => setSourceFilter('all')}>All Tasks</Chip>
              <Chip active={sourceFilter === 'my'} onClick={() => setSourceFilter('my')}>My Tasks</Chip>
              <Chip active={sourceFilter === 'family'} onClick={() => setSourceFilter('family')}>Family Tasks</Chip>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

            <div style={{ display: 'flex', gap: '4px' }}>
              <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</Chip>
              <Chip active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')}>Pending</Chip>
              <Chip active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')}>Completed</Chip>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

            <div style={{ display: 'flex', gap: '4px' }}>
              <Chip active={priorityFilter === 'all'} onClick={() => setPriorityFilter('all')}>All Priority</Chip>
              <Chip active={priorityFilter === 'high'} onClick={() => setPriorityFilter('high')}>High</Chip>
              <Chip active={priorityFilter === 'medium'} onClick={() => setPriorityFilter('medium')}>Medium</Chip>
              <Chip active={priorityFilter === 'low'} onClick={() => setPriorityFilter('low')}>Low</Chip>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700 }}>Color Legend:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }} />
            Completed
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            Pending
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            Overdue
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
            Assigned by Member
          </span>
        </div>
      </GlassCard>

      {/* VIEW MODE 1: MONTH VIEW */}
      {viewMode === 'month' && (
        <GlassCard hoverEffect={false} style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '700px' }}>
            {/* Day Header Row */}
            {dayNames.map((d) => (
              <div key={d} style={{ textAlign: 'center', padding: '8px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}

            {/* Month Grid Cells */}
            {monthDaysGrid.map((cell) => {
              const cellTodos = todosByDate[cell.dateIso] || [];
              const isToday = cell.dateIso === todayIso;

              return (
                <div
                  key={cell.dateIso}
                  onClick={() => handleDateClick(cell.dateIso)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnDate(e, cell.dateIso)}
                  style={{
                    minHeight: '110px',
                    padding: '8px',
                    borderRadius: '12px',
                    background: cell.isCurrentMonth ? (isToday ? 'var(--accent-soft)' : 'var(--bg-input)') : 'rgba(0,0,0,0.02)',
                    border: isToday ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    opacity: cell.isCurrentMonth ? 1 : 0.45,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: isToday ? 800 : 700,
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: isToday ? 'var(--accent-color)' : 'transparent',
                        color: isToday ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      {cell.date.getDate()}
                    </span>

                    {cellTodos.length > 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '8px' }}>
                        {cellTodos.length}
                      </span>
                    )}
                  </div>

                  {/* Task Event Badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '80px' }}>
                    {cellTodos.map((todo) => {
                      const badgeStyle = getEventBadgeStyle(todo);
                      return (
                        <div
                          key={todo._id || todo.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, todo)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTask(todo);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'grab',
                            ...badgeStyle,
                          }}
                          title={`${todo.title} (Drag to reschedule)`}
                        >
                          {todo.completed ? '✓ ' : ''}{todo.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* VIEW MODE 2: WEEK VIEW */}
      {viewMode === 'week' && (
        <GlassCard hoverEffect={false} style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', minWidth: '700px' }}>
            {weekDaysGrid.map((cell) => {
              const cellTodos = todosByDate[cell.dateIso] || [];
              const isToday = cell.dateIso === todayIso;

              return (
                <div
                  key={cell.dateIso}
                  onClick={() => handleDateClick(cell.dateIso)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnDate(e, cell.dateIso)}
                  style={{
                    minHeight: '380px',
                    padding: '12px',
                    borderRadius: '16px',
                    background: isToday ? 'var(--accent-soft)' : 'var(--bg-input)',
                    border: isToday ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                      {dayNames[cell.date.getDay()]}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isToday ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                      {cell.date.getDate()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
                    {cellTodos.map((todo) => {
                      const badgeStyle = getEventBadgeStyle(todo);
                      return (
                        <div
                          key={todo._id || todo.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, todo)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTask(todo);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'grab',
                            ...badgeStyle,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{todo.title}</span>
                            {todo.priority && <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 800 }}>{todo.priority}</span>}
                          </div>
                          {todo.description && (
                            <p style={{ fontSize: '0.74rem', opacity: 0.8, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {todo.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* VIEW MODE 3: DAY VIEW */}
      {viewMode === 'day' && (
        <GlassCard hoverEffect={false} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              Agenda for {formatDateIso(currentDate)}
            </h3>
            <PrimaryButton icon={PlusIcon} onClick={() => handleDateClick(formatDateIso(currentDate))}>
              Add Task for Today
            </PrimaryButton>
          </div>

          {(() => {
            const dayIso = formatDateIso(currentDate);
            const dayTodos = todosByDate[dayIso] || [];

            if (dayTodos.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <CalendarIcon size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 700 }}>No tasks scheduled for this day</p>
                  <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Click the button above to schedule a new task.</p>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayTodos.map((todo) => {
                  const badgeStyle = getEventBadgeStyle(todo);
                  return (
                    <div
                      key={todo._id || todo.id}
                      onClick={() => handleSelectTask(todo)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        ...badgeStyle,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, textDecoration: todo.completed ? 'line-through' : 'none' }}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <p style={{ fontSize: '0.86rem', opacity: 0.85, marginTop: '4px' }}>{todo.description}</p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.78rem' }}>
                          <span>Assigned: <strong>{todo.assignedToName || 'Unassigned'}</strong></span>
                          <span>Priority: <strong style={{ textTransform: 'uppercase' }}>{todo.priority}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <SecondaryButton
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(todo._id || todo.id);
                          }}
                        >
                          {todo.completed ? 'Mark Pending' : 'Complete'}
                        </SecondaryButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </GlassCard>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
          }}
        >
          <GlassCard hoverEffect={false} style={{ maxWidth: '520px', width: '100%', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Schedule Task on {selectedDate}</h3>
              <IconButton icon={CloseIcon} onClick={() => setShowCreateModal(false)} title="Close" />
            </div>

            {formError && <div className="auth-error" style={{ marginBottom: '14px' }}>{formError}</div>}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <TextInput label="Task Title" placeholder="e.g. Design review meeting" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              <TextInput label="Description" placeholder="Task details or context..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              
              <PremiumSelect label="Priority" options={priorityOptions} value={newPriority} onChange={(val) => setNewPriority(val)} />
              <PremiumSelect label="Assign To" options={assignOptions} value={newAssignedTo} onChange={(val) => setNewAssignedTo(val)} />
              <TextInput label="Due Date" type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <SecondaryButton onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                <PrimaryButton type="submit">Schedule Task</PrimaryButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* TASK DETAILS SIDE PANEL / MODAL */}
      {selectedTask && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTask(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
          }}
        >
          <GlassCard hoverEffect={false} style={{ maxWidth: '540px', width: '100%', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Task Details</h3>
              <IconButton icon={CloseIcon} onClick={() => setSelectedTask(null)} title="Close" />
            </div>

            {isEditingTask ? (
              <form onSubmit={handleSaveTaskEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <TextInput label="Task Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                <TextInput label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                <PremiumSelect label="Priority" options={priorityOptions} value={editPriority} onChange={(val) => setEditPriority(val)} />
                <PremiumSelect label="Assign To" options={assignOptions} value={editAssignedTo} onChange={(val) => setEditAssignedTo(val)} />
                <TextInput label="Due Date" type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} required />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <SecondaryButton onClick={() => setIsEditingTask(false)}>Cancel</SecondaryButton>
                  <PrimaryButton type="submit">Save Changes</PrimaryButton>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, textDecoration: selectedTask.completed ? 'line-through' : 'none' }}>
                    {selectedTask.title}
                  </h4>
                  {selectedTask.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                      {selectedTask.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-input)', padding: '16px', borderRadius: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Priority</span>
                    <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-color)', marginTop: '2px' }}>
                      {selectedTask.priority || 'medium'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                    <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: selectedTask.completed ? 'var(--success-color)' : 'var(--warning-color)', marginTop: '2px' }}>
                      {selectedTask.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned To</span>
                    <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, marginTop: '2px' }}>
                      {selectedTask.assignedToName || 'Unassigned'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Due Date</span>
                    <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, marginTop: '2px' }}>
                      {selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : 'No Due Date'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SecondaryButton icon={EditIcon} onClick={() => setIsEditingTask(true)}>
                      Edit Task
                    </SecondaryButton>
                    <SecondaryButton danger icon={TrashIcon} onClick={() => { onDeleteTodo(selectedTask._id || selectedTask.id); setSelectedTask(null); }}>
                      Delete
                    </SecondaryButton>
                  </div>

                  <PrimaryButton
                    icon={CheckIcon}
                    onClick={() => {
                      onToggleComplete(selectedTask._id || selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    {selectedTask.completed ? 'Mark Pending' : 'Mark Complete'}
                  </PrimaryButton>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
