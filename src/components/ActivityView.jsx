import React, { useState, useMemo } from 'react';
import GlassCard from './ui/GlassCard';
import { SearchInput } from './ui/Input';
import { ActivityIcon, ClockIcon, CheckIcon, PlusIcon, TrashIcon, UserIcon, RefreshIcon } from './Icons';

export default function ActivityView({ activities = [], onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchText = (act.details || act.type || '').toLowerCase();
      return matchText.includes(searchTerm.toLowerCase());
    });
  }, [activities, searchTerm]);

  function getActivityIcon(type) {
    const t = (type || '').toUpperCase();
    if (t.includes('CREATE')) return <PlusIcon size={16} />;
    if (t.includes('COMPLETE')) return <CheckIcon size={16} />;
    if (t.includes('DELETE')) return <TrashIcon size={16} />;
    if (t.includes('LOGIN') || t.includes('LOGOUT')) return <UserIcon size={16} />;
    return <ActivityIcon size={16} />;
  }

  function getActivityBadgeClass(type) {
    const t = (type || '').toUpperCase();
    if (t.includes('CREATE')) return 'success';
    if (t.includes('COMPLETE')) return 'accent';
    if (t.includes('DELETE')) return 'danger';
    return 'warning';
  }

  return (
    <div className="activity-view-container">
      {/* Header Bar */}
      <GlassCard className="activity-header-card" hoverEffect={false} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Activity & Audit Trail</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time security logs, login sessions, and task execution history.
            </p>
          </div>
          {onRefresh && (
            <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
              <RefreshIcon size={14} />
              <span>Refresh Log</span>
            </button>
          )}
        </div>
      </GlassCard>

      {/* Control Bar */}
      <div style={{ marginBottom: '20px' }}>
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Filter activity timeline logs..." />
      </div>

      {/* Activity Timeline List */}
      <GlassCard hoverEffect={false}>
        {filteredActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <ActivityIcon size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Activity Recorded</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
              Actions performed in your workspace will be logged here in real time.
            </p>
          </div>
        ) : (
          <div className="activity-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredActivities.map((act, index) => (
              <div
                key={act.id || act._id || index}
                className="timeline-item"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  className={`activity-icon-badge ${getActivityBadgeClass(act.type)}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getActivityIcon(act.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.details || act.type}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ClockIcon size={12} />
                      {new Date(act.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Triggered by User Session • Action Scope: Workspace
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
