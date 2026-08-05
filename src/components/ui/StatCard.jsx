import React from 'react';
import GlassCard from './GlassCard';

export default function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'accent', // 'accent' | 'success' | 'warning' | 'flame'
  progress = null,
  className = '',
}) {
  return (
    <GlassCard className={`stat-card-widget ${className}`}>
      <div className="stats-card-header">
        <span className="stats-label">{label}</span>
        {Icon && (
          <div className={`stats-icon-wrapper icon-${variant}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stats-value">{value}</div>
      {progress !== null && (
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
    </GlassCard>
  );
}
