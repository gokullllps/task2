import React, { useState } from 'react';
import { SunIcon, MoonIcon } from './Icons';

export default function ThemeToggle({ theme, setTheme }) {
  const [isRotating, setIsRotating] = useState(false);

  function toggleTheme() {
    setIsRotating(true);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    setTimeout(() => setIsRotating(false), 400);
  }

  const isLight = theme === 'light';

  return (
    <button
      className={`theme-toggle-btn ${isRotating ? 'rotating' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      style={{
        position: 'relative',
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-color)',
        color: 'var(--accent-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-glass)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <div
        className="theme-icon-rotator"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isLight ? 'rotate(0deg) scale(1)' : 'rotate(180deg) scale(1)',
          transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {isLight ? <MoonIcon size={20} /> : <SunIcon size={20} />}
      </div>
      <span className="theme-glow-ripple" />
    </button>
  );
}