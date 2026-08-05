import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from './ui/GlassCard';
import Avatar from './ui/Avatar';
import { PrimaryButton, SecondaryButton, IconButton } from './ui/Button';
import { TextInput } from './ui/Input';
import PremiumSelect from './ui/Select';
import { UserIcon, PlusIcon, TrashIcon, EditIcon, ShieldIcon, CheckIcon, ClockIcon, CloseIcon, RefreshIcon, LogoutIcon } from './Icons';
import api from '../utils/api';

export default function FamilyView({
  user,
  todos = [],
  familySystemData = {},
  onRefreshFamily,
}) {
  const currentUsername = typeof user === 'string' ? user : user?.username || 'User';
  const currentUserId = typeof user === 'object' ? user.id || user._id || currentUsername : currentUsername;

  const {
    hasFamily = false,
    isOwner = false,
    status = null, // 'Active' | 'Pending' | null
    family = null,
    membership = null,
    members = [],
    pendingRequests = [],
  } = familySystemData;

  // Private Member Aliases State (Map of memberId -> alias string)
  const [memberAliases, setMemberAliases] = useState({});
  const [editingAliasMemberId, setEditingAliasMemberId] = useState(null);
  const [aliasInput, setAliasInput] = useState('');

  // Load private member aliases for logged-in user
  useEffect(() => {
    const aliasMap = {};
    members.forEach((m) => {
      const mId = m._id || m.id;
      const key = `family_member_alias_${currentUserId}_${mId}`;
      const val = localStorage.getItem(key);
      if (val) {
        aliasMap[mId] = val;
      }
    });
    setMemberAliases(aliasMap);
  }, [currentUserId, members]);

  // View state & Modals
  const [activeSubTab, setActiveSubTab] = useState('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingProfileMember, setViewingProfileMember] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState('');

  // Forms State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState('Member');

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const officialName = family?.name || 'Family';

  // Role Options for PremiumSelect
  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Member', label: 'Member' },
  ];

  // Transfer Ownership Options for PremiumSelect
  const transferOptions = useMemo(() => {
    return members
      .filter((m) => m.role !== 'Owner')
      .map((m) => ({
        value: m._id || m.id,
        label: `${m.name} (${m.email})`,
      }));
  }, [members]);

  // Copy Code
  const handleCopyCode = () => {
    if (family && family.code) {
      navigator.clipboard.writeText(family.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Share Code
  const handleShareCode = async () => {
    if (!family || !family.code) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${officialName} on Praskla Todo`,
          text: `Use Family Code: ${family.code} to join ${officialName} on Praskla Todo!`,
          url: window.location.href,
        });
      } catch (err) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  // Regenerate Code
  const handleRegenerateCode = async () => {
    try {
      const res = await api.regenerateFamilyCode();
      if (res.success) {
        onRefreshFamily();
        setStatusMsg('Family code regenerated successfully! Previous code invalidated.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to regenerate code.');
      setTimeout(() => setErrorMsg(''), 3500);
    }
  };

  // Private Member Alias Actions (Contact Storage per currentUserId + memberId)
  const handleSaveMemberAlias = (memberId) => {
    const trimmed = aliasInput.trim();
    const key = `family_member_alias_${currentUserId}_${memberId}`;
    if (trimmed) {
      localStorage.setItem(key, trimmed);
      setMemberAliases((prev) => ({ ...prev, [memberId]: trimmed }));
    } else {
      localStorage.removeItem(key);
      setMemberAliases((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
    }
    setEditingAliasMemberId(null);
    setAliasInput('');
  };

  const handleRemoveMemberAlias = (memberId) => {
    const key = `family_member_alias_${currentUserId}_${memberId}`;
    localStorage.removeItem(key);
    setMemberAliases((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
    setEditingAliasMemberId(null);
    setAliasInput('');
  };

  // Add Member Submit
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) return;

    try {
      setErrorMsg('');
      const res = await api.addFamilyMember({
        name: addName.trim(),
        email: addEmail.trim(),
        phone: addPhone.trim(),
        role: addRole,
      });

      if (res.success) {
        onRefreshFamily();
        setAddName('');
        setAddEmail('');
        setAddPhone('');
        setAddRole('Member');
        setShowAddMemberModal(false);
        setStatusMsg('Family member added successfully!');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add member.');
    }
  };

  // Edit Member Alias & Role Modal Save Submit
  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    const memberId = editingMember._id || editingMember.id;

    try {
      setErrorMsg('');

      // Save Private Member Alias locally
      handleSaveMemberAlias(memberId);

      // If owner updated role, update role only
      if (isOwner && editingMember.role) {
        await api.updateFamilyMember(memberId, {
          role: editingMember.role,
        });
        onRefreshFamily();
      }

      setEditingMember(null);
      setStatusMsg('Member private alias updated successfully!');
      setTimeout(() => setStatusMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update member.');
    }
  };

  // Transfer Ownership
  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedNewOwnerId) return;

    if (!window.confirm('Are you sure you want to transfer Family Ownership? You will become an Admin.')) return;

    try {
      setErrorMsg('');
      const res = await api.transferFamilyOwnership(selectedNewOwnerId);
      if (res.success) {
        onRefreshFamily();
        setShowTransferModal(false);
        setStatusMsg(res.message);
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to transfer ownership.');
    }
  };

  // Delete Family
  const handleDeleteFamily = async () => {
    if (!family) return;
    if (!window.confirm(`Are you SURE you want to delete family "${officialName}"? All member associations will be removed.`)) return;

    try {
      const res = await api.deleteFamily(family._id);
      if (res.success) {
        onRefreshFamily();
        setStatusMsg('Family deleted.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete family.');
    }
  };

  // Join Family Code Action
  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    try {
      setErrorMsg('');
      const res = await api.joinFamily(joinCodeInput.trim());
      if (res.success) {
        onRefreshFamily();
        setJoinCodeInput('');
        setStatusMsg('Join request sent successfully! Awaiting owner approval.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to join family.');
    }
  };

  // Create Family Action
  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const res = await api.createFamily(newFamilyName.trim());
      if (res.success) {
        onRefreshFamily();
        setNewFamilyName('');
        setStatusMsg('Family created successfully!');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create family.');
    }
  };

  // Cancel Request
  const handleCancelRequest = async () => {
    try {
      const res = await api.cancelJoinRequest();
      if (res.success) {
        onRefreshFamily();
        setStatusMsg('Join request cancelled.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel request.');
    }
  };

  // Leave Family
  const handleLeaveFamily = async () => {
    if (!window.confirm('Are you sure you want to leave this family?')) return;
    try {
      const res = await api.leaveFamily();
      if (res.success) {
        onRefreshFamily();
        setStatusMsg('You have left the family.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to leave family.');
    }
  };

  // Approve Request
  const handleApproveRequest = async (requestId) => {
    try {
      const res = await api.approveJoinRequest(requestId);
      if (res.success) {
        onRefreshFamily();
        setStatusMsg('Join request approved! Member added to family.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to approve request.');
    }
  };

  // Reject Request
  const handleRejectRequest = async (requestId) => {
    try {
      const res = await api.rejectJoinRequest(requestId);
      if (res.success) {
        onRefreshFamily();
        setStatusMsg('Join request declined.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to decline request.');
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId) => {
    try {
      const res = await api.removeFamilyMember(memberId);
      if (res.success) {
        onRefreshFamily();
        if (viewingProfileMember && (viewingProfileMember._id === memberId || viewingProfileMember.id === memberId)) {
          setViewingProfileMember(null);
        }
        setStatusMsg('Member removed from family.');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove member.');
    }
  };

  const familyProgressPercent = useMemo(() => {
    if (todos.length === 0) return 100;
    const completed = todos.filter((t) => t.completed).length;
    return Math.round((completed / todos.length) * 100);
  }, [todos]);

  const myAssignedTasks = useMemo(() => {
    return todos.filter((t) => (t.assignedToName || t.assignedTo || '').toLowerCase().includes(currentUsername.toLowerCase()));
  }, [todos, currentUsername]);

  // =========================================================================
  // STATE 1: NON-FAMILY STATE (!hasFamily && status !== 'Pending')
  // =========================================================================
  if (!hasFamily && status !== 'Pending') {
    return (
      <div className="family-view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <GlassCard
          hoverEffect={false}
          style={{
            textAlign: 'center',
            padding: '40px 32px',
            maxWidth: '560px',
            width: '100%',
            margin: '40px auto',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-strong)',
          }}
        >
          <UserIcon size={56} style={{ color: 'var(--accent-color)', opacity: 0.8, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            You are not part of any Family
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.5 }}>
            Create your own family to manage workspace members or join an existing family using a unique code.
          </p>

          {errorMsg && <div className="auth-error" style={{ marginBottom: '20px' }}>{errorMsg}</div>}
          {statusMsg && <div className="auth-success" style={{ marginBottom: '20px' }}>{statusMsg}</div>}

          {/* Form 1: Create Family */}
          <form onSubmit={handleCreateFamily} style={{ textAlign: 'left', marginBottom: '24px' }}>
            <TextInput
              label="Create your own family"
              placeholder={`${currentUsername}'s Family`}
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
            <PrimaryButton type="submit" block style={{ marginTop: '12px' }}>
              Create Family
            </PrimaryButton>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ padding: '0 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Form 2: Join Family */}
          <form onSubmit={handleJoinFamily} style={{ textAlign: 'left' }}>
            <TextInput
              label="Join an existing family"
              placeholder="Family Code (e.g. FAM-7KQ9-X2PA)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              required
            />
            <SecondaryButton type="submit" block style={{ marginTop: '12px' }}>
              Join Family
            </SecondaryButton>
          </form>
        </GlassCard>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: PENDING REQUEST STATE (status === 'Pending')
  // =========================================================================
  if (status === 'Pending') {
    return (
      <div className="family-view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <GlassCard
          hoverEffect={false}
          style={{
            textAlign: 'center',
            padding: '40px 32px',
            maxWidth: '540px',
            width: '100%',
            margin: '40px auto',
            borderRadius: '24px',
            border: '2px solid var(--warning-color)',
            boxShadow: 'var(--shadow-strong)',
          }}
        >
          <ClockIcon size={56} style={{ color: 'var(--warning-color)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Pending Approval</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: '20px', lineHeight: 1.5 }}>
            Your request to join <strong>{family?.name || 'the family'}</strong> has been sent. Please wait for the Family Owner to approve your request.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--warning-soft)', color: 'var(--warning-color)', fontWeight: 700, fontSize: '0.84rem', marginBottom: '28px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning-color)' }} />
            <span>Awaiting Owner Approval</span>
          </div>

          <div>
            <SecondaryButton danger icon={CloseIcon} onClick={handleCancelRequest}>
              Cancel Request
            </SecondaryButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  // =========================================================================
  // STATE 3 & 4: FAMILY DASHBOARD (ONLY IF hasFamily === true && status === 'Active')
  // =========================================================================
  return (
    <div className="family-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Family Dashboard Header (Displays ONLY Official Family Name) */}
      <GlassCard className="family-header-card" hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {officialName}
              </h2>

              <span className="profile-status-badge">
                <ShieldIcon size={12} />
                <span>{isOwner ? 'Family Owner' : 'Active Member'}</span>
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {members.length} Active Member{members.length !== 1 ? 's' : ''} • Overall Progress: <strong style={{ color: 'var(--accent-color)' }}>{familyProgressPercent}% Velocity</strong>
            </p>
          </div>

          {/* Action Controls Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isOwner ? (
              <>
                <PrimaryButton icon={PlusIcon} onClick={() => setShowAddMemberModal(true)}>
                  Add Member
                </PrimaryButton>

                <SecondaryButton onClick={handleShareCode}>
                  Share Code
                </SecondaryButton>
              </>
            ) : (
              <SecondaryButton danger icon={LogoutIcon} onClick={handleLeaveFamily}>
                Leave Family
              </SecondaryButton>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveSubTab('members')}
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              background: activeSubTab === 'members' ? 'var(--accent-color)' : 'transparent',
              color: activeSubTab === 'members' ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              height: '40px',
            }}
          >
            Family Members ({members.length})
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              background: activeSubTab === 'settings' ? 'var(--accent-color)' : 'transparent',
              color: activeSubTab === 'settings' ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              height: '40px',
            }}
          >
            Family Settings
          </button>
        </div>
      </GlassCard>

      {statusMsg && <div className="auth-success">{statusMsg}</div>}
      {errorMsg && <div className="auth-error">{errorMsg}</div>}

      {/* Pending Join Requests Section (OWNER ONLY) */}
      {isOwner && pendingRequests.length > 0 && (
        <GlassCard hoverEffect={false} style={{ border: '2px solid var(--warning-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockIcon size={18} />
            <span>Pending Join Requests ({pendingRequests.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map((req) => (
              <div key={req._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-input)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar username={req.name} size="md" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700 }}>{req.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.email}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <PrimaryButton size="sm" onClick={() => handleApproveRequest(req._id)}>Approve</PrimaryButton>
                  <SecondaryButton size="sm" danger onClick={() => handleRejectRequest(req._id)}>Reject</SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <GlassCard hoverEffect={false} style={{ border: '2px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Member to Family</h3>
            <IconButton icon={CloseIcon} onClick={() => setShowAddMemberModal(false)} title="Close" />
          </div>
          <form onSubmit={handleAddMemberSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 140px 140px', gap: '16px', alignItems: 'end' }}>
            <TextInput label="Member Name" placeholder="e.g. Alex Johnson" value={addName} onChange={(e) => setAddName(e.target.value)} required />
            <TextInput label="Email Address" placeholder="alex@praskla.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required />
            <TextInput label="Phone Number" placeholder="+1 (555) 019-2834" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} />
            
            <PremiumSelect
              label="Role"
              options={roleOptions}
              value={addRole}
              onChange={(val) => setAddRole(val)}
            />

            <div style={{ marginBottom: 0 }}>
              <PrimaryButton type="submit" block style={{ height: '44px' }}>Save Member</PrimaryButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Edit Private Member Alias Modal (Email Disabled, Official Username Read-Only) */}
      {editingMember && (
        <GlassCard hoverEffect={false} style={{ border: '2px solid var(--accent-color)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Private Member Alias
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Set a private nickname for this member on your account. Email and Official Username cannot be edited.
              </p>
            </div>
            <IconButton icon={CloseIcon} onClick={() => setEditingMember(null)} title="Cancel" />
          </div>

          <form onSubmit={handleEditMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Field 1: Nickname (Private Alias) - EDITABLE */}
            <TextInput
              label="Nickname (Private Alias)"
              placeholder="e.g. Bro, Son, Anna"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
            />

            {/* Field 2: Official Username - READ ONLY / DISABLED */}
            <TextInput
              label="Official Username (Read Only)"
              value={editingMember.name}
              disabled
            />

            {/* Field 3: Email Address - READ ONLY / DISABLED */}
            <TextInput
              label="Email Address (Read Only)"
              value={editingMember.email}
              disabled
            />

            {/* Role Selection (if Owner) */}
            {isOwner && (
              <PremiumSelect
                label="Role"
                options={roleOptions}
                value={editingMember.role}
                onChange={(val) => setEditingMember({ ...editingMember, role: val })}
              />
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <SecondaryButton onClick={() => setEditingMember(null)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit">
                Save Alias
              </PrimaryButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <GlassCard hoverEffect={false} style={{ border: '2px solid var(--warning-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-color)' }}>Transfer Family Ownership</h3>
            <IconButton icon={CloseIcon} onClick={() => setShowTransferModal(false)} title="Cancel" />
          </div>
          <form onSubmit={handleTransferOwnership} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <PremiumSelect
                label="Select New Family Owner"
                placeholder="Select an active member..."
                options={transferOptions}
                value={selectedNewOwnerId}
                onChange={(val) => setSelectedNewOwnerId(val)}
              />
            </div>
            <PrimaryButton type="submit" style={{ height: '44px', padding: '10px 24px' }}>
              Confirm Transfer
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      {/* Detailed Member Profile Modal */}
      {viewingProfileMember && (
        <GlassCard hoverEffect={false} style={{ border: '2px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar username={viewingProfileMember.name} size="xl" showStatus />
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{viewingProfileMember.name}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{viewingProfileMember.email}</p>
                <span className="profile-status-badge" style={{ marginTop: '6px' }}>
                  <ShieldIcon size={12} />
                  <span>{viewingProfileMember.role} • Active Member</span>
                </span>
              </div>
            </div>
            <IconButton icon={CloseIcon} onClick={() => setViewingProfileMember(null)} title="Close Profile" />
          </div>

          {/* Member Detailed Task Breakdown */}
          {(() => {
            const memberTodos = todos.filter((t) => (t.assignedToName || t.assignedTo || '').toLowerCase().includes(viewingProfileMember.name.toLowerCase()));
            const completed = memberTodos.filter((t) => t.completed).length;
            const pending = memberTodos.length - completed;
            const percent = memberTodos.length > 0 ? Math.round((completed / memberTodos.length) * 100) : 100;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: 'var(--bg-input)', padding: '20px', borderRadius: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Joined Date</span>
                  <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{new Date(viewingProfileMember.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Tasks</span>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)', marginTop: '2px' }}>{memberTodos.length} ({completed} completed)</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pending Items</span>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning-color)', marginTop: '2px' }}>{pending} pending</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Productivity Score</span>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-color)', marginTop: '2px' }}>{percent}% Velocity</span>
                </div>
              </div>
            );
          })()}
        </GlassCard>
      )}

      {/* SUB-TAB 1: MEMBERS GRID WITH EDIT ALIAS BUTTON & PRIVATE ALIAS SYSTEM */}
      {activeSubTab === 'members' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Family Members ({members.length})</h3>
          </div>

          <div className="family-members-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {members.map((member) => {
              const memberId = member._id || member.id;
              const officialUsername = member.name;
              const privateAlias = memberAliases[memberId] || '';

              const assignedTodos = todos.filter((t) => (t.assignedToName || t.assignedTo || '').toLowerCase().includes(officialUsername.toLowerCase()));
              const completedCount = assignedTodos.filter((t) => t.completed).length;
              const pendingCount = assignedTodos.length - completedCount;
              const completionPercent = assignedTodos.length > 0 ? Math.round((completedCount / assignedTodos.length) * 100) : 100;

              return (
                <GlassCard key={memberId} className="family-member-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Avatar username={officialUsername} size="lg" showStatus />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Display Rules: Private Alias Primary, Official Username Secondary */}
                        {privateAlias ? (
                          <>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                              {privateAlias}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>
                              Official Username: {officialUsername}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {officialUsername}
                          </span>
                        )}

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</span>
                      </div>
                    </div>

                    <span className="profile-status-badge">
                      <ShieldIcon size={12} />
                      <span>{member.role}</span>
                    </span>
                  </div>

                  {/* Private Alias Status Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-input)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {privateAlias ? `Private Alias: "${privateAlias}"` : 'No Private Alias set'}
                    </span>
                    
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setAliasInput(privateAlias);
                      }}
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--accent-color)',
                        fontWeight: 700,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {privateAlias ? 'Edit Alias' : 'Add Alias'}
                    </button>
                  </div>

                  {/* Real-Time Member Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', padding: '12px', borderRadius: '12px', background: 'var(--bg-input)', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned</span>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{assignedTodos.length}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--success-color)', textTransform: 'uppercase', fontWeight: 700 }}>Done</span>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-color)' }}>{completedCount}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--warning-color)', textTransform: 'uppercase', fontWeight: 700 }}>Pending</span>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--warning-color)' }}>{pendingCount}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textTransform: 'uppercase', fontWeight: 700 }}>Score</span>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-color)' }}>{completionPercent}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SecondaryButton size="sm" block onClick={() => setViewingProfileMember(member)}>
                      View Profile
                    </SecondaryButton>

                    <IconButton
                      icon={EditIcon}
                      onClick={() => {
                        setEditingMember(member);
                        setAliasInput(privateAlias);
                      }}
                      title="Edit member private alias"
                      ariaLabel="Edit alias"
                    />

                    {isOwner && member.role !== 'Owner' && (
                      <IconButton icon={TrashIcon} danger onClick={() => handleRemoveMember(memberId)} title="Remove member from family" ariaLabel="Remove member" />
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </>
      )}

      {/* SUB-TAB 2: FAMILY SETTINGS PANEL */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Family Code Management */}
          {isOwner && (
            <GlassCard hoverEffect={false} style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Family Code & Sharing</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                Share this unique family code with team members so they can request to join. Regenerating invalidates the previous code immediately.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--bg-input)', padding: '0 24px', height: '44px', display: 'flex', alignItems: 'center', borderRadius: '12px', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                  {family.code}
                </div>
                <SecondaryButton onClick={handleCopyCode} style={{ height: '44px', padding: '10px 20px' }}>
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </SecondaryButton>
                <SecondaryButton onClick={handleShareCode} style={{ height: '44px', padding: '10px 20px' }}>
                  Share Code
                </SecondaryButton>
                <SecondaryButton icon={RefreshIcon} onClick={handleRegenerateCode} style={{ height: '44px', padding: '10px 20px' }}>
                  Regenerate Code
                </SecondaryButton>
              </div>
            </GlassCard>
          )}

          {/* Ownership Transfer & Danger Zone */}
          <GlassCard hoverEffect={false} style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger-color)', marginBottom: '8px' }}>
              Management & Danger Zone
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Transfer family ownership to another active member, leave the family, or delete the family permanently.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {isOwner && (
                <SecondaryButton onClick={() => setShowTransferModal(true)} style={{ height: '44px', padding: '10px 20px' }}>
                  Transfer Ownership
                </SecondaryButton>
              )}
              
              {!isOwner && (
                <SecondaryButton danger icon={LogoutIcon} onClick={handleLeaveFamily} style={{ height: '44px', padding: '10px 20px' }}>
                  Leave Family
                </SecondaryButton>
              )}

              {isOwner && (
                <SecondaryButton danger onClick={handleDeleteFamily} style={{ height: '44px', padding: '10px 20px' }}>
                  Delete Family Permanently
                </SecondaryButton>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Member's Assigned Tasks View */}
      {!isOwner && (
        <GlassCard hoverEffect={false}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckIcon size={18} />
            <span>My Assigned Tasks ({myAssignedTasks.length})</span>
          </h3>
          {myAssignedTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '16px 0' }}>
              No tasks currently assigned to you.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myAssignedTasks.map((todo) => (
                <div key={todo.id || todo._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-input)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</span>
                    {todo.description && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{todo.description}</span>}
                  </div>
                  <span className={`priority-pill ${todo.priority || 'medium'}`}>
                    {todo.completed ? 'Completed' : todo.priority || 'medium'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
