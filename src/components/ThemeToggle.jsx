import React, { useState } from 'react';
import { SunIcon, MoonIcon } from './Icons';

function playThemeSwitchSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.022);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.022);
  } catch {
    // Ignore autoplay restriction exceptions
  }
}

export default function ThemeToggle({ theme, setTheme }) {
  const [isPressed, setIsPressed] = useState(false);
  const isDark = theme === 'dark';

  function toggleTheme() {
    playThemeSwitchSound();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      className="theme-pill-toggle"
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className={`theme-pill-track ${isDark ? 'dark-mode' : 'light-mode'} ${isPressed ? 'pressed' : ''}`}>
        <div className="theme-pill-thumb">
          <div className="theme-thumb-ring" />
          <div className="theme-thumb-icon">
            {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </div>
        </div>
        <div className="theme-pill-labels">
          <span className={`theme-label-icon dark ${isDark ? 'active' : ''}`}>
            <MoonIcon size={14} />
          </span>
          <span className={`theme-label-icon light ${!isDark ? 'active' : ''}`}>
            <SunIcon size={14} />
          </span>
        </div>
      </div>
    </button>
  );
}