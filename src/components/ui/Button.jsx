import React from 'react';

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  block = false,
  icon: Icon,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  style = {},
  ...props
}) {
  const isBlock = block || fullWidth;

  const baseStyle = {
    display: isBlock ? 'flex' : 'inline-flex',
    width: isBlock ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: size === 'sm' ? '36px' : size === 'lg' ? '52px' : '44px',
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '10px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--accent-color)',
    color: '#ffffff',
    fontSize: size === 'sm' ? '0.84rem' : size === 'lg' ? '1rem' : '0.92rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 200ms ease',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`primary-button ${className}`}
      style={baseStyle}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  block = false,
  danger = false,
  icon: Icon,
  className = '',
  size = 'md',
  style = {},
  ...props
}) {
  const isBlock = block || fullWidth;

  const baseStyle = {
    display: isBlock ? 'flex' : 'inline-flex',
    width: isBlock ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: size === 'sm' ? '36px' : size === 'lg' ? '52px' : '44px',
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '10px 20px',
    borderRadius: '12px',
    border: danger ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
    background: danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
    color: danger ? 'var(--danger-color)' : 'var(--text-primary)',
    fontSize: size === 'sm' ? '0.84rem' : size === 'lg' ? '1rem' : '0.92rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 200ms ease',
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`secondary-button ${className}`}
      style={baseStyle}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  icon: Icon,
  onClick,
  title,
  ariaLabel,
  danger = false,
  size = 'md',
  style = {},
  ...props
}) {
  const dimension = size === 'sm' ? '32px' : size === 'lg' ? '44px' : '36px';

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dimension,
    height: dimension,
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    background: danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
    color: danger ? 'var(--danger-color)' : 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    padding: 0,
    ...style,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      className="icon-button"
      style={baseStyle}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
    </button>
  );
}
