import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon } from '../Icons';

export default function PremiumSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  disabled = false,
  error,
  fullWidth = true,
  className = '',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0, width: 0, openAbove: false });
  
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Dynamic position & auto-flipping calculation
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const panelHeight = 220;
    const openAbove = spaceBelow < panelHeight && rect.top > spaceBelow;

    setPortalPosition({
      top: openAbove ? Math.max(10, rect.top - panelHeight - 6) : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      openAbove,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Recalculate position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  return (
    <div
      className={`premium-select-container ${className}`}
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%',
          height: '44px',
          padding: '0 16px',
          borderRadius: '12px',
          background: 'var(--bg-input)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          border: error
            ? '1px solid var(--danger-color)'
            : isOpen
            ? '1px solid var(--accent-color)'
            : '1px solid var(--border-color)',
          fontSize: '0.92rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 200ms ease',
          boxShadow: isOpen ? '0 0 0 2px var(--accent-soft)' : 'none',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {selectedOption?.icon && <selectedOption.icon size={16} style={{ color: 'var(--accent-color)' }} />}
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Custom Chevron SVG */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Blur Dropdown Panel Mounted via React Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="glass-panel"
            style={{
              position: 'fixed',
              top: `${portalPosition.top}px`,
              left: `${portalPosition.left}px`,
              width: `${portalPosition.width}px`,
              zIndex: 99999,
              padding: '6px',
              borderRadius: '12px',
              maxHeight: '220px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-strong)',
              animation: 'fadeIn 200ms ease-out',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)',
            }}
          >
            {options.length === 0 ? (
              <div style={{ padding: '10px', fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--accent-soft)' : 'transparent',
                      color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 150ms ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-input)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      {opt.icon && <opt.icon size={16} />}
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                    </div>

                    {isSelected && <CheckIcon size={16} style={{ color: 'var(--accent-color)' }} />}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}

      {error && (
        <span style={{ fontSize: '0.76rem', color: 'var(--danger-color)', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}
