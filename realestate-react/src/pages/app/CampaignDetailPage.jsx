import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCampaign } from '../../hooks/useCampaign';
import { fmt$ } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { data: campaign, sellers: campaignSellers, messages, loading, error } = useCampaign(id);

  if (loading) return <LoadingSpinner />;

  if (error || !campaign) {
    return (
      <div className="app-page">
        <div className="app-page-header">
          <div>
            <Link to="/app/campaigns" className="app-back-link">&larr; Back to campaigns</Link>
            <h1 className="app-page-title">Campaign not found</h1>
          </div>
        </div>
      </div>
    );
  }

  // Build simple performance chart from messages (group by date)
  const perfMap = {};
  messages.forEach(m => {
    if (!m.date) return;
    if (!perfMap[m.date]) perfMap[m.date] = 0;
    perfMap[m.date]++;
  });
  const perfData = Object.entries(perfMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, events: count }));

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <Link to="/app/campaigns" className="app-back-link">&larr; Campaigns</Link>
          <h1 className="app-page-title">{campaign.name}</h1>
          <p className="app-page-sub">{campaign.channel} &middot; {campaign.agent}</p>
        </div>
        <div className="app-page-header-right">
          <span className={`app-status-pill ${campaign.status}`}>{campaign.status}</span>
        </div>
      </div>

      <div className="app-kpi-row">
        <div className="app-kpi-card">
          <div className="app-kpi-label">Messages Sent</div>
          <div className="app-kpi-value">{campaign.sent.toLocaleString()}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Responses</div>
          <div className="app-kpi-value">{campaign.responses}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Response Rate</div>
          <div className="app-kpi-value" style={{ color: campaign.rate >= 10 ? 'var(--green)' : undefined }}>
            {campaign.rate > 0 ? campaign.rate + '%' : '\u2014'}
          </div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Created</div>
          <div className="app-kpi-value sm">{campaign.created}</div>
        </div>
      </div>

      <div className="app-grid-2">
        {/* Message log */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Message Log</h2>
          </div>
          <div className="app-card-body">
            {messages.length === 0 ? (
              <EmptyState title="No messages yet" description="Campaign activity will appear here." />
            ) : messages.map((m, i) => (
              <div className="app-message-row" key={i}>
                <div className="app-message-meta">
                  <span className={`app-message-type ${m.type || ''}`}>{(m.type || 'event').toUpperCase()}</span>
                  <span className="app-message-date">{m.date}</span>
                </div>
                <div className="app-message-content">{m.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Targeted sellers */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Targeted Sellers</h2>
            <span className="app-card-badge">{campaignSellers.length}</span>
          </div>
          <div className="app-card-body">
            {campaignSellers.length === 0 ? (
              <EmptyState title="No sellers linked" description="Link sellers to this campaign." />
            ) : campaignSellers.map(s => (
              <Link to={`/app/pipeline/${s.id}`} className="app-mini-row" key={s.id}>
                <div className="app-mini-row-left">
                  <span className={`app-score-dot ${s.score >= 90 ? 'high' : s.score >= 85 ? 'mid' : 'low'}`}></span>
                  <div>
                    <div className="app-mini-row-title">{s.address}</div>
                    <div className="app-mini-row-sub">{s.city} &middot; Score {s.score}</div>
                  </div>
                </div>
                <div className="app-mini-row-right">
                  <span className="app-mini-row-est">{fmt$(s.est)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Performance Over Time */}
          <div className="app-card-header" style={{ borderTop: '1px solid var(--gray-100)' }}>
            <h2 className="app-card-title">Performance Over Time</h2>
          </div>
          <div className="app-card-body">
            {perfData.length === 0 ? (
              <EmptyState title="No performance data" description="Activity data will populate this chart." />
            ) : (
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <LineChart data={perfData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--gray-900)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                    <Line type="monotone" dataKey="events" stroke="var(--green)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
