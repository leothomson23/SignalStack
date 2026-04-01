'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Key,
  Shield,
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/UserContext';

type Tab = 'profile' | 'organisation' | 'tokens' | 'security';

interface OrgMember {
  id: string;
  userId: string;
  orgId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SettingsPage() {
  const { user, orgId, orgName, loading: userLoading, refresh } = useUser();

  const [tab, setTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Organisation
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER');
  const [inviting, setInviting] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Populate profile fields from user context
  useEffect(() => {
    if (user && !profileInitialized) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setProfileInitialized(true);
    }
  }, [user, profileInitialized]);

  // Load org members when organisation tab is selected
  useEffect(() => {
    if (tab === 'organisation' && orgId) {
      setMembersLoading(true);
      api
        .get<{ members: OrgMember[] }>(`/organisations/${orgId}/members`)
        .then((res) => {
          setMembers(res.members || []);
        })
        .catch(() => {
          setMembers([]);
        })
        .finally(() => {
          setMembersLoading(false);
        });
    }
  }, [tab, orgId]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put<{ message: string; user: unknown }>('/users/profile', { name, bio });
      await refresh();
      showToast('success', 'Profile updated');
    } catch {
      showToast('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !orgId) return;
    setInviting(true);
    try {
      await api.post(`/organisations/${orgId}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      showToast('success', 'Invitation sent');
      setInviteEmail('');
      // Reload members
      const res = await api.get<{ members: OrgMember[] }>(`/organisations/${orgId}/members`);
      setMembers(res.members || []);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showToast('error', apiErr.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    // No backend endpoint exists yet
    setTimeout(() => {
      showToast('error', 'Password change not yet supported');
      setChangingPassword(false);
    }, 500);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organisation', label: 'Organisation', icon: Building2 },
    { id: 'tokens', label: 'API Tokens', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (userLoading && !user) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-32" />
        <div className="card p-6 space-y-4">
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-600/20 border-2 border-brand-500/30 flex items-center justify-center">
                <User className="w-7 h-7 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input max-w-md"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={email} disabled className="input max-w-md opacity-60" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="input max-w-md resize-none"
              />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Organisation Tab */}
      {tab === 'organisation' && (
        <div className="space-y-6 max-w-2xl">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Organisation Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Organisation Name</label>
                <input
                  type="text"
                  value={orgName || ''}
                  disabled
                  className="input max-w-md opacity-60"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Organisation name cannot be changed from here
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Members</h3>
            </div>

            {/* Invite */}
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="input flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'VIEWER')}
                className="input w-32"
              >
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="btn-primary"
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </>
                )}
              </button>
            </div>

            {/* Members list */}
            {membersLoading ? (
              <div className="space-y-3 py-2">
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {m.user.name}
                      </p>
                      <p className="text-xs text-gray-500">{m.user.email}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">{m.role}</span>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-sm text-gray-500 py-4">No members found</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Tokens Tab */}
      {tab === 'tokens' && (
        <div className="space-y-6 max-w-2xl">
          <div className="card p-6">
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Key className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                API Token Management
              </p>
              <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  API token management coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
            Change Password
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative max-w-md">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="input max-w-md"
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="input max-w-md"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={toast.type === 'success' ? 'toast-success' : 'toast-error'}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
