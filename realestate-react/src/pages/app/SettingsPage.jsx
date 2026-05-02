import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTeam } from '../../hooks/useTeam';
import { useIntegrations } from '../../hooks/useIntegrations';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { data: team, loading: teamLoading, addMember, removeMember } = useTeam();
  const { data: integrations, loading: intLoading, toggleIntegration } = useIntegrations();

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    brokerage: profile?.brokerage || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Invite member state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Agent' });
  const [inviteSaving, setInviteSaving] = useState(false);

  const loading = teamLoading || intLoading;
  if (loading) return <LoadingSpinner />;

  async function handleProfileSave() {
    setProfileSaving(true);
    await supabase.from('profiles').update(profileForm).eq('id', profile.id);
    await refreshProfile();
    setEditingProfile(false);
    setProfileSaving(false);
  }

  async function handleInvite() {
    setInviteSaving(true);
    try {
      await addMember(inviteForm);
      setShowInvite(false);
      setInviteForm({ name: '', email: '', role: 'Agent' });
    } catch { /* ignore */ }
    setInviteSaving(false);
  }

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Settings</h1>
          <p className="app-page-sub">Account, team, and integrations</p>
        </div>
      </div>

      <div className="app-grid-2">
        {/* Account */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Account</h2>
            {!editingProfile && (
              <button className="app-btn-secondary" onClick={() => {
                setProfileForm({ full_name: profile?.full_name || '', brokerage: profile?.brokerage || '' });
                setEditingProfile(true);
              }}>Edit</button>
            )}
          </div>
          <div className="app-card-body">
            {editingProfile ? (
              <div className="settings-form">
                <div className="field">
                  <label className="field-label">Name</label>
                  <input className="field-input" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Brokerage</label>
                  <input className="field-input" value={profileForm.brokerage} onChange={e => setProfileForm(p => ({ ...p, brokerage: e.target.value }))} />
                </div>
                <div className="settings-form-actions">
                  <button className="app-btn-primary" onClick={handleProfileSave} disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="app-btn-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="app-detail-grid">
                <div className="app-detail-item">
                  <span className="app-detail-label">Name</span>
                  <span className="app-detail-value">{profile?.full_name || '\u2014'}</span>
                </div>
                <div className="app-detail-item">
                  <span className="app-detail-label">Email</span>
                  <span className="app-detail-value">{profile?.email || '\u2014'}</span>
                </div>
                <div className="app-detail-item">
                  <span className="app-detail-label">Brokerage</span>
                  <span className="app-detail-value">{profile?.brokerage || '\u2014'}</span>
                </div>
                <div className="app-detail-item">
                  <span className="app-detail-label">Role</span>
                  <span className="app-detail-value">{profile?.role || 'Agent'}</span>
                </div>
                <div className="app-detail-item">
                  <span className="app-detail-label">Plan</span>
                  <span className="app-detail-value" style={{ color: 'var(--green)' }}>{profile?.plan || 'Pro'}</span>
                </div>
                <div className="app-detail-item">
                  <span className="app-detail-label">Member Since</span>
                  <span className="app-detail-value">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '\u2014'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Team</h2>
            <button className="app-btn-secondary" onClick={() => setShowInvite(!showInvite)}>Invite member</button>
          </div>
          <div className="app-card-body">
            {showInvite && (
              <div className="settings-form" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)' }}>
                <div className="field">
                  <label className="field-label">Name</label>
                  <input className="field-input" placeholder="Full name" value={inviteForm.name} onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Email</label>
                  <input className="field-input" type="email" placeholder="email@example.com" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="settings-form-actions">
                  <button className="app-btn-primary" onClick={handleInvite} disabled={inviteSaving || !inviteForm.name || !inviteForm.email}>
                    {inviteSaving ? 'Sending...' : 'Send invite'}
                  </button>
                  <button className="app-btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
                </div>
              </div>
            )}
            {team.length === 0 ? (
              <EmptyState title="No team members" description="Invite your first team member." />
            ) : team.map(m => (
              <div className="app-mini-row" key={m.id}>
                <div className="app-mini-row-left">
                  <div className="app-sidebar-avatar sm">{m.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className="app-mini-row-title">{m.name}</div>
                    <div className="app-mini-row-sub">{m.role}</div>
                  </div>
                </div>
                <div className="app-mini-row-right">
                  <span className={`app-status-pill ${m.status === 'active' ? 'active' : m.status === 'invited' ? 'draft' : 'idle'}`}>{m.status}</span>
                  <button className="app-btn-icon" onClick={() => removeMember(m.id)} title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="app-card">
        <div className="app-card-header">
          <h2 className="app-card-title">Integrations &amp; Data Sources</h2>
          <span className="app-card-badge">Plug &amp; play</span>
        </div>
        <div className="app-card-body">
          {integrations.length === 0 ? (
            <EmptyState title="No integrations" description="Integrations will be configured here." />
          ) : (
            <div className="app-integrations-grid">
              {integrations.map(int => (
                <div className={`app-integration-card${int.connected ? ' connected' : ''}`} key={int.id}>
                  <div className="app-integration-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <div className="app-integration-info">
                    <div className="app-integration-name">{int.name}</div>
                    <div className="app-integration-desc">{int.description}</div>
                  </div>
                  <button
                    className={`app-status-pill ${int.connected ? 'active' : 'idle'}`}
                    onClick={() => toggleIntegration(int.id, !int.connected)}
                  >
                    {int.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications placeholder */}
      <div className="app-card">
        <div className="app-card-header">
          <h2 className="app-card-title">Notifications</h2>
        </div>
        <div className="app-card-body">
          <div className="app-art-placeholder" style={{ height: 120 }}>
            <div className="app-art-placeholder-inner">
              <span>Notification preferences coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
