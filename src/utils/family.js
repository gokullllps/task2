// Family / Team Member management utility (scoped per account)

export function getFamilyMembers(username) {
  const key = username ? `aether_family_${username.toLowerCase()}` : 'aether_family_default';
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing family data:', e);
    }
  }
  // Default sample family/team members
  return [
    { id: 'mem-1', name: 'Goku (You)', role: 'Admin', email: 'goku@aether.io' },
    { id: 'mem-2', name: 'Alex Johnson', role: 'Editor', email: 'alex@aether.io' },
    { id: 'mem-3', name: 'Sarah Miller', role: 'Member', email: 'sarah@aether.io' },
  ];
}

export function saveFamilyMembers(username, members) {
  const key = username ? `aether_family_${username.toLowerCase()}` : 'aether_family_default';
  localStorage.setItem(key, JSON.stringify(members));
}

export function addFamilyMember(username, newMember) {
  const members = getFamilyMembers(username);
  const member = {
    id: `mem-${Date.now()}`,
    name: newMember.name,
    role: newMember.role || 'Member',
    email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@aether.io`,
    createdAt: new Date().toISOString(),
  };
  const updated = [...members, member];
  saveFamilyMembers(username, updated);
  return updated;
}

export function removeFamilyMember(username, memberId) {
  const members = getFamilyMembers(username);
  const updated = members.filter((m) => m.id !== memberId);
  saveFamilyMembers(username, updated);
  return updated;
}
