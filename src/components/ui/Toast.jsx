import React, { useEffect } from 'react';
import { CheckIcon, CloseIcon } from '../Icons';

export function Toast({
  id,
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  message,
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckIcon,
      bgColor: 'var(--success-soft)',
      borderColor: 'var(--success-soft)',
      textColor: 'var(--success-color)',
    },
    error: {
      icon: CloseIcon,
      bgColor: 'var(--danger-soft)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      textColor: 'var(--danger-color)',
    },
    warning: {
      icon: CheckIcon,
      bgColor: 'var(--warning-soft)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      textColor: 'var(--warning-color)',
    },
    info: {
      icon: CheckIcon,
      bgColor: 'var(--accent-soft)',
      borderColor: 'var(--accent-soft)',
      textColor: 'var(--accent-color)',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`toast-item toast-${type} glass-panel`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${config.borderColor}`,
        boxShadow: 'var(--shadow-strong)',
        minWidth: '280px',
        maxWidth: '420px',
        animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: config.bgColor,
          color: config.textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>

      <span
        style={{
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          flex: 1,
        }}
      >
        {message}
      </span>

      <button
        type="button"
        onClick={() => onClose(id)}
        aria-label="Dismiss toast"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts = [], onCloseToast }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onCloseToast} />
      ))}
    </div>
  );
}

export default Toast;
