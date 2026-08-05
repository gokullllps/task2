import React from 'react';

export function PriorityBadge({ priority = 'medium', className = '' }) {
  const normalized = (priority || 'medium').toLowerCase();
  return (
    <span className={`priority-pill ${normalized} ${className}`}>
      {normalized}
    </span>
  );
}

export function StatusBadge({ completed = false, className = '' }) {
  return (
    <span className={`status-pill ${completed ? 'completed' : 'pending'} ${className}`}>
      {completed ? 'Completed' : 'In Progress'}
    </span>
  );
}

export function Chip({ children, className = '', active = false, onClick }) {
  return (
    <button
      type="button"
      className={`chip-pill ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
