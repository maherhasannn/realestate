import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../hooks/useCampaigns';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function CampaignsPage() {
  const { data: campaigns, loading } = useCampaigns();
  const [filter, setFilter] = useState('all');

  if (loading) return <LoadingSpinner />;

  const filtered = filter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === filter);

  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalResp = campaigns.reduce((a, c) => a + c.responses, 0);

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Campaigns</h1>
          <p className="app-page-sub">{campaigns.length} campaigns &middot; {totalSent.toLocaleString()} messages sent</p>
        </div>
        <div className="app-page-header-right">
          <button className="app-btn-primary">New campaign</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="app-kpi-row">
        <div className="app-kpi-card">
          <div className="app-kpi-label">Active</div>
          <div className="app-kpi-value">{campaigns.filter(c => c.status === 'active').length}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Messages Sent</div>
          <div className="app-kpi-value">{totalSent.toLocaleString()}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Total Responses</div>
          <div className="app-kpi-value">{totalResp}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Avg Response Rate</div>
          <div className="app-kpi-value" style={{ color: 'var(--green)' }}>{totalSent > 0 ? (totalResp / totalSent * 100).toFixed(1) : '0.0'}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="app-filters">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'paused', label: 'Paused' },
          { key: 'draft', label: 'Draft' },
        ].map(f => (
          <button
            key={f.key}
            className={`app-filter-pill${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create your first campaign to start reaching sellers."
          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg>}
        />
      ) : (
        <div className="app-table-wrap">
          <div className="app-table-header campaign-grid">
            <span>Campaign</span>
            <span>Channel</span>
            <span>Agent</span>
            <span>Status</span>
            <span>Sent</span>
            <span>Replies</span>
            <span>Rate</span>
          </div>
          <div className="app-table-body">
            {filtered.map(c => (
              <Link to={`/app/campaigns/${c.id}`} className="app-table-row campaign-grid" key={c.id}>
                <span className="app-table-address">{c.name}</span>
                <span className="app-table-sub">{c.channel}</span>
                <span className="app-table-sub">{c.agent}</span>
                <span><span className={`app-status-pill ${c.status}`}>{c.status}</span></span>
                <span className="app-table-mono">{c.sent.toLocaleString()}</span>
                <span className="app-table-mono">{c.responses}</span>
                <span className="app-table-mono" style={{ color: c.rate >= 10 ? 'var(--green)' : 'var(--gray-500)', fontWeight: 500 }}>
                  {c.rate > 0 ? c.rate + '%' : '\u2014'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
