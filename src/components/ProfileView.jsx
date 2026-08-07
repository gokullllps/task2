import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './ui/GlassCard';
import Avatar from './ui/Avatar';
import { PrimaryButton, SecondaryButton } from './ui/Button';
import { CameraIcon, TrashIcon, AwardIcon, ShieldIcon, FlameIcon, CheckIcon } from './Icons';
import { getUserAvatar, saveUserAvatar, removeUserAvatar, fileToBase64 } from '../utils/avatar';
import api from '../utils/api';

export default function ProfileView({ user, todos, onUpdateUser }) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';
  const currentEmail = typeof user === 'object' ? user?.email || `${currentUsername.toLowerCase()}@prasklatechnology.com` : `${currentUsername.toLowerCase()}@prasklatechnology.com`;
  const joinedDate = typeof user === 'object' && user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2026';

  const [avatar, setAvatar] = useState(() => user?.avatar || getUserAvatar(currentUsername));
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [bio, setBio] = useState(() => user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof user === 'object' && user) {
      if (user.phone !== undefined) setPhone(user.phone || '');
      if (user.bio !== undefined) setBio(user.bio || '');
      if (user.avatar !== undefined) setAvatar(user.avatar || '');
    }
  }, [user]);

  const completedCount = (todos || []).filter((t) => t.completed).length;
  const totalCount = (todos || []).length;
  const scorePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate dynamic streak based on consecutive completion dates
  const streakDays = (() => {
    const completedTodos = (todos || []).filter((t) => t.completed);
    if (completedTodos.length === 0) return 0;
    const dateSet = new Set();
    completedTodos.forEach((t) => {
      const rawDate = t.updatedAt || t.createdAt;
      if (rawDate) {
        try {
          dateSet.add(new Date(rawDate).toISOString().split('T')[0]);
        } catch (e) {}
      }
    });
    if (dateSet.size === 0) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) return 0;
    let streak = 0;
    let curr = new Date();
    if (!dateSet.has(todayStr)) curr.setDate(curr.getDate() - 1);
    while (true) {
      const dStr = curr.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveStatus('');
      const res = await api.updateProfile({ phone, bio, avatar });
      if (res.success) {
        setSaveStatus('Profile updated in MongoDB successfully!');
        if (onUpdateUser && res.user) {
          onUpdateUser(res.user);
        }
      } else {
        setSaveStatus(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setSaveStatus(err.message || 'Error connecting to database server.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setAvatar(base64);
        saveUserAvatar(currentUsername, base64);
        const res = await api.updateProfile({ avatar: base64 });
        if (res.success && onUpdateUser) {
          onUpdateUser(res.user);
        }
        setSaveStatus('Profile photo saved to database!');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (err) {
        console.error('Error processing avatar:', err);
      }
    }
  };

  const handleRemovePhoto = async () => {
    setAvatar(null);
    removeUserAvatar(currentUsername);
    try {
      const res = await api.updateProfile({ avatar: '' });
      if (res.success && onUpdateUser) {
        onUpdateUser(res.user);
      }
    } catch (e) {}
    setSaveStatus('Profile photo removed.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="profile-view-container">
      {/* Profile Header Hero */}
      <GlassCard className="profile-header-card" hoverEffect={false}>
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <Avatar username={currentUsername} src={avatar} size="xl" showStatus />
            <button
              className="avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Photo"
            >
              <CameraIcon size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="profile-identity">
            <h2 className="profile-name">{currentUsername}</h2>
            <p className="profile-email">{currentEmail}</p>
            <div className="profile-badges">
              <span className="profile-status-badge">
                <ShieldIcon size={12} />
                <span>Active Pro Member</span>
              </span>
              <span className="profile-joined-badge">Joined {joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="profile-photo-actions">
          <SecondaryButton size="sm" icon={CameraIcon} onClick={() => fileInputRef.current?.click()}>
            Upload Photo
          </SecondaryButton>
          {avatar && (
            <SecondaryButton size="sm" danger icon={TrashIcon} onClick={handleRemovePhoto}>
              Remove Photo
            </SecondaryButton>
          )}
        </div>
      </GlassCard>

      {saveStatus && <div className="auth-success" style={{ marginBottom: '20px' }}>{saveStatus}</div>}

      {/* Profile Main Grid */}
      <div className="profile-grid">
        {/* User Details & Bio Form */}
        <GlassCard className="profile-card" hoverEffect={false}>
          <h3 className="profile-card-title">Personal Information</h3>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={currentUsername} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={currentEmail} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Bio / Persona</label>
            <textarea
              placeholder="Tell your team about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving to Database...' : 'Save Profile Changes'}
            </PrimaryButton>
          </div>
        </GlassCard>

        {/* Statistics & Achievement Badges */}
        <GlassCard className="profile-card" hoverEffect={false}>
          <h3 className="profile-card-title">Productivity Achievements</h3>

          <div className="achievements-grid">
            <div className="achievement-item">
              <div className="achievement-icon gold">
                <AwardIcon size={22} />
              </div>
              <div className="achievement-info">
                <span className="achievement-title">Task Master</span>
                <span className="achievement-desc">{completedCount} tasks completed</span>
              </div>
            </div>

            <div className="achievement-item">
              <div className="achievement-icon flame">
                <FlameIcon size={22} />
              </div>
              <div className="achievement-info">
                <span className="achievement-title">{streakDays}-Day Focus Streak</span>
                <span className="achievement-desc">{streakDays > 0 ? 'Active consistency record' : 'Complete tasks daily to build your streak'}</span>
              </div>
            </div>

            <div className="achievement-item">
              <div className="achievement-icon green">
                <CheckIcon size={22} />
              </div>
              <div className="achievement-info">
                <span className="achievement-title">Efficiency Rating</span>
                <span className="achievement-desc">{scorePercent}% completion score</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
