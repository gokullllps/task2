import React from 'react';
import { TaskIcon, CheckIcon, ChartIcon } from './Icons';

export default function StatsCards({ totalCount, completedCount, pendingCount }) {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <div className="stats-card-header">
          <span className="stats-label">Total Tasks</span>
          <div className="stats-icon-wrapper icon-primary">
            <TaskIcon size={20} />
          </div>
        </div>
        <div className="stats-value">{totalCount}</div>
        <div className="stats-meta">Work Items Created</div>
      </div>

      <div className="stats-card">
        <div className="stats-card-header">
          <span className="stats-label">Pending Tasks</span>
          <div className="stats-icon-wrapper icon-warning">
            <ChartIcon size={20} />
          </div>
        </div>
        <div className="stats-value">{pendingCount}</div>
        <div className="stats-meta">Requires Attention</div>
      </div>

      <div className="stats-card">
        <div className="stats-card-header">
          <span className="stats-label">Completed</span>
          <div className="stats-icon-wrapper icon-success">
            <CheckIcon size={20} />
          </div>
        </div>
        <div className="stats-value">{completedCount}</div>
        <div className="stats-meta">Successfully Finished</div>
      </div>

      <div className="stats-card">
        <div className="stats-card-header">
          <span className="stats-label">Completion Rate</span>
          <div className="stats-icon-wrapper icon-accent">
            <span className="stats-percent-symbol">%</span>
          </div>
        </div>
        <div className="stats-value">{completionRate}%</div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
