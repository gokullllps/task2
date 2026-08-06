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
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

