import React from 'react';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  style = {},
  ...props
}) {
  return (
    <div
      className={`glass-panel ${hoverEffect ? 'glass-card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-glass)',
        transition: 'all var(--transition-base)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
