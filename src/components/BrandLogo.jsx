import React from 'react';
import PrasklaLogo from './ui/PrasklaLogo';

export default function BrandLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div className={`brand-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <PrasklaLogo size={size} color="var(--text-primary)" />

      {showText && (
        <div className="sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="brand-title"
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Praskla
          </span>
          <span
            className="brand-subtitle"
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            Technology
          </span>
        </div>
      )}
    </div>
  );
}

