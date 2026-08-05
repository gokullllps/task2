import React from 'react';

export function EmptyTasksIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="70" fill="url(#empty_grad)" fillOpacity="0.15" />
      <rect x="45" y="35" width="70" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2" />
      <rect x="60" y="55" width="40" height="6" rx="3" fill="var(--accent-color)" fillOpacity="0.4" />
      <rect x="60" y="70" width="30" height="6" rx="3" fill="var(--text-muted)" fillOpacity="0.3" />
      <rect x="60" y="85" width="35" height="6" rx="3" fill="var(--text-muted)" fillOpacity="0.3" />
      <circle cx="105" cy="105" r="22" fill="var(--accent-color)" />
      <path d="M98 105L103 110L112 100" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <radialGradient id="empty_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 80) rotate(90) scale(70)">
          <stop stopColor="var(--accent-color)" />
          <stop offset="1" stopColor="var(--accent-color)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function EmptySearchIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="45" fill="var(--bg-card)" stroke="var(--accent-color)" strokeWidth="3" strokeDasharray="4 4" />
      <circle cx="75" cy="75" r="25" fill="var(--accent-soft)" />
      <path d="M108 108L135 135" stroke="var(--text-muted)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
