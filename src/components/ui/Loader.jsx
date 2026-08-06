import React from 'react';

export function Loader({ size = 'md', label = 'Loading...', fullScreen = false }) {
  const dimensions = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;

  const content = (
    <div
      className="loader-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: fullScreen ? '0' : '24px',
      }}
    >
      <div
        className="premium-loader-ring"
        style={{
          position: 'relative',
          width: `${dimensions}px`,
          height: `${dimensions}px`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderBottomColor: 'var(--accent-hover)',
            animation: 'spin 1.4s linear infinite reverse',
            opacity: 0.7,
          }}
        />
      </div>

      {label && (
        <span
          style={{
            fontSize: size === 'sm' ? '0.78rem' : '0.88rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-primary)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

export default Loader;
