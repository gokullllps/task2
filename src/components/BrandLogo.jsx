import React from 'react';

export default function BrandLogo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`brand-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {/* Original Praskla Todo Minimal Flat SVG Logo */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        {/* Base Emerald Circle */}
        <rect width="40" height="40" rx="10" fill="#10b981" />
        
        {/* Geometric Minimal Vector Paths (Stacked Layered Quadrants) */}
        <path d="M12 14L20 22L28 14" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22L20 30L28 22" stroke="#ffffff" strokeWidth="3" strokeOpacity="0.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {showText && (
        <div className="sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Praskla
          </span>
          <span className="brand-subtitle" style={{ fontSize: '0.72rem', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Todo
          </span>
        </div>
      )}
    </div>
  );
}
