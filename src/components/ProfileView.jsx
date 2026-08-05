import React, { useState, useRef } from 'react';
import GlassCard from './ui/GlassCard';
import Avatar from './ui/Avatar';
import { SecondaryButton } from './ui/Button';
import { CameraIcon, TrashIcon, AwardIcon, ShieldIcon, FlameIcon, CheckIcon } from './Icons';
import { getUserAvatar, saveUserAvatar, removeUserAvatar, fileToBase64 } from '../utils/avatar';

export default function ProfileView({ user, todos }) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';
  const currentEmail = typeof user === 'object' ? user?.email || `${currentUsername.toLowerCase()}@aether.io` : `${currentUsername.toLowerCase()}@aether.io`;
  const joinedDate = typeof user === 'object' && user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2026';

  const [avatar, setAvatar] = useState(() => getUserAvatar(currentUsername));
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [bio, setBio] = useState('Productivity enthusiast & software builder. Focusing on high-impact workflows.');
  const [saveStatus, setSaveStatus] = useState('');
  const fileInputRef = useRef(null);

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const scorePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setAvatar(base64);
        saveUserAvatar(currentUsername, base64);
        setSaveStatus('Profile photo updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (err) {
        console.error('Error processing avatar:', err);
      }
    }
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
    removeUserAvatar(currentUsername);
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
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Bio / Persona</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
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
                <span className="achievement-title">5-Day Focus Streak</span>
                <span className="achievement-desc">Active consistency record</span>
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
