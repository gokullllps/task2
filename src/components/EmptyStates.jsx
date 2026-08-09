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

export function EmptyHomeOverviewIllustration({ size = 90 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="var(--accent-soft)" fillOpacity="0.5" />
      <rect x="35" y="30" width="50" height="60" rx="10" fill="var(--bg-card)" stroke="var(--accent-color)" strokeWidth="2" />
      <circle cx="60" cy="52" r="14" fill="var(--accent-color)" fillOpacity="0.2" />
      <path d="M54 52L58 56L66 48" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="45" y="74" width="30" height="4" rx="2" fill="var(--text-muted)" fillOpacity="0.4" />
    </svg>
  );
}

export function PrioritySpotlightIllustration({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,15 62,38 87,42 68,60 73,85 50,73 27,85 32,60 13,42 38,38" fill="var(--warning-soft)" stroke="var(--warning-color)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="10" fill="var(--warning-color)" fillOpacity="0.3" />
    </svg>
  );
}
