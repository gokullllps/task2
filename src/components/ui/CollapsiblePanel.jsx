import React, { useState } from 'react';

export function CollapsiblePanel({
  title,
  children,
  action,
  defaultExpanded = true,
  className = '',
  style = {},
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`collapsible-panel glass-panel ${isExpanded ? 'expanded' : 'collapsed'} ${className}`}
      style={{
        borderRadius: '14px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-glass)',
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        height: 'auto',
        ...style,
      }}
    >
      {/* Panel Header (Clean Section Title Alone, Zero Duplicate Icons) */}
      <div
        className="panel-header"
        onClick={toggleExpand}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <h3
          style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {action}
          <button
            type="button"
            onClick={toggleExpand}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms ease',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              flexShrink: 0,
            }}
            className="chevron-toggle-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animated Expandable Body */}
      <div
        className="panel-content-grid"
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            className="panel-body"
            style={{
              padding: '0 16px 14px 16px',
              paddingTop: '6px',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollapsiblePanel;

