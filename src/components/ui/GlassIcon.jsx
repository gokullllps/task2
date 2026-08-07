import React from 'react';

export function GlassIcon({
  icon: Icon,
  size = 20,
  badgeSize = 40,
  className = '',
  style = {},
  variant = 'accent', // 'accent' | 'success' | 'warning' | 'danger'
}) {
  const variantStyles = {
    accent: {
      bg: 'var(--accent-soft)',
      color: 'var(--accent-color)',
      border: 'var(--accent-soft)',
    },
    success: {
      bg: 'var(--success-soft)',
      color: 'var(--success-color)',
      border: 'var(--success-soft)',
    },
    warning: {
      bg: 'var(--warning-soft)',
      color: 'var(--warning-color)',
      border: 'rgba(251, 191, 36, 0.25)',
    },
    danger: {
      bg: 'var(--danger-soft)',
      color: 'var(--danger-color)',
      border: 'rgba(248, 113, 113, 0.25)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.accent;

  return (
    <div
      className={`glass-icon-badge ${className}`}
      style={{
        width: `${badgeSize}px`,
        height: `${badgeSize}px`,
        borderRadius: '50%',
        background: currentVariant.bg,
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${currentVariant.border}`,
        color: currentVariant.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        flexShrink: 0,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {Icon && <Icon size={size} />}
    </div>
  );
}

export default GlassIcon;
