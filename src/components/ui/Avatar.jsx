import React from 'react';

export default function Avatar({
  username = 'User',
  src = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showStatus = false,
  className = '',
}) {
  const sizeMap = {
    sm: { width: 28, height: 28, fontSize: '0.8rem' },
    md: { width: 34, height: 34, fontSize: '0.9rem' },
    lg: { width: 48, height: 48, fontSize: '1.2rem' },
    xl: { width: 90, height: 90, fontSize: '2.2rem' },
  };

  const dim = sizeMap[size] || sizeMap.md;
  const initial = (username || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`ui-avatar-container ${className}`}
      style={{
        position: 'relative',
        width: dim.width,
        height: dim.width,
        borderRadius: '50%',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={username}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-glass)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: dim.fontSize,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          }}
        >
          {initial}
        </div>
      )}

      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, Math.floor(dim.width * 0.28)),
            height: Math.max(8, Math.floor(dim.width * 0.28)),
            borderRadius: '50%',
            background: 'var(--accent-color)',
            border: '2px solid var(--bg-card)',
          }}
        />
      )}
    </div>
  );
}
