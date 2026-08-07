import React from 'react';

export default function BrandLogo({ size = 34, showText = true, className = '' }) {
  return (
    <div className={`brand-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      {/* Custom Vector Logo matching user attached image */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Top Curved Wave Bar (Deep Purple) */}
        <path
          d="M 17 38 C 17 24, 30 18, 50 18 C 70 18, 80 18, 88 12 C 92 8, 93 4, 94 2 C 95 10, 92 18, 80 23 C 68 28, 48 27, 30 27 C 22 27, 18 31, 17 38 Z"
          fill="url(#purpleGradient)"
        />

        {/* Left Curved Horn / Crescent (Deep Purple) */}
        <path
          d="M 29 20 C 31 24, 46 42, 46 54 C 46 66, 30 84, 30 84 C 30 84, 43 72, 43 54 C 43 40, 29 20, 29 20 Z"
          fill="url(#purpleGradient)"
        />

        {/* Right Curved Horn / Crescent (Deep Purple) */}
        <path
          d="M 71 20 C 69 24, 54 42, 54 54 C 54 66, 70 84, 70 84 C 70 84, 57 72, 57 54 C 57 40, 71 20, 71 20 Z"
          fill="url(#purpleGradient)"
        />

        {/* Silver / Grey Orbital Ring (Front Waist Band) */}
        <path
          d="M 30 52 C 30 67, 70 67, 70 52"
          stroke="#9ca3af"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="brand-title"
            style={{
              fontSize: '1.15rem',
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
              fontSize: '0.72rem',
              color: 'var(--accent-color)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Todo
          </span>
        </div>
      )}
    </div>
  );
}

