import React, { useState } from 'react';

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'icon'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  fullWidth = false,
  block = false,
  danger = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  style = {},
  ariaLabel,
  title,
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const isBlock = block || fullWidth;
  const effectiveVariant = danger && variant === 'secondary' ? 'danger' : variant;

  const handlePointerDown = (e) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleSize = Math.max(rect.width, rect.height);
    const newRipple = { x, y, size: rippleSize, id: Date.now() };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  const classNames = [
    'btn',
    `btn-${effectiveVariant}`,
    `btn-${size}`,
    isBlock ? 'btn-block' : '',
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={ariaLabel || (effectiveVariant === 'icon' ? title : undefined)}
      title={title}
      className={classNames}
      style={style}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
          </svg>
        </span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-icon-svg" />
          )}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && (
            <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-icon-svg" />
          )}
        </>
      )}

      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn-ripple"
          style={{
            top: r.y - r.size / 2,
            left: r.x - r.size / 2,
            width: r.size,
            height: r.size,
          }}
        />
      ))}
    </button>
  );
}

export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

export function SuccessButton(props) {
  return <Button variant="success" {...props} />;
}

export function OutlineButton(props) {
  return <Button variant="outline" {...props} />;
}

export function GhostButton(props) {
  return <Button variant="ghost" {...props} />;
}

export function IconButton({ icon, title, ariaLabel, danger, ...props }) {
  return <Button variant={danger ? 'danger' : 'icon'} icon={icon} ariaLabel={ariaLabel || title} title={title} {...props} />;
}

export function LoadingButton(props) {
  return <Button loading={true} {...props} />;
}

export default Button;

