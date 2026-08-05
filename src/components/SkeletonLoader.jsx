import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'hero') {
    return (
      <div className="skeleton-hero glass-panel" style={{ height: '140px', padding: '24px', marginBottom: '24px' }}>
        <div className="skeleton-line" style={{ width: '40%', height: '24px', marginBottom: '12px', borderRadius: '6px' }} />
        <div className="skeleton-line" style={{ width: '65%', height: '16px', borderRadius: '4px' }} />
      </div>
    );
  }

  return (
    <div className="skeleton-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton-card glass-panel"
          style={{
            height: '76px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderRadius: '14px',
          }}
        >
          <div className="skeleton-circle" style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: '50%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton-line" style={{ width: '80%', height: '12px', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
