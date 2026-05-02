import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSellers } from '../../hooks/useSellers';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAnalytics } from '../../hooks/useAnalytics';
import { fmt$ } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function DashboardPage() {
  const { data: sellers, loading: sellersLoading } = useSellers();
  const { data: campaigns, loading: campaignsLoading } = useCampaigns();
  const { snapshots, loading: analyticsLoading } = useAnalytics();

  const loading = sellersLoading || campaignsLoading || analyticsLoading;
  if (loading) return <LoadingSpinner />;

  const totalVolume = sellers.reduce((a, s) => a + s.est, 0);
  const avgScore = sellers.length ? (sellers.reduce((a, s) => a + s.score, 0) / sellers.length).toFixed(1) : '0';
  const highSignals = sellers.filter(s => s.score >= 90).length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalResp = campaigns.reduce((a, c) => a + c.responses, 0);

  const topSellers = [...sellers].sort((a, b) => b.score - a.score).slice(0, 5);
  const recentCampaigns = [...campaigns].sort((a, b) => b.id - a.id).slice(0, 4);

  // Chart data from analytics snapshots
  const chartData = snapshots.map(s => ({
    week: s.weekLabel,
    listings: s.projectedListings,
  }));
  const chartTotal = chartData.reduce((a, d) => a + d.listings, 0);

  // Funnel from latest snapshot or computed from sellers/campaigns
  const latestSnap = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const funnel = [
    { label: 'Identified', value: latestSnap?.identified ?? sellers.length, width: 100, color: 'var(--gray-200)' },
    { label: 'Contacted', value: latestSnap?.contacted ?? sellers.filter(s => s.inOutreach).length, width: 72, color: 'var(--green-bg-strong)' },
    { label: 'Responded', value: latestSnap?.responded ?? totalResp, width: 44, color: 'var(--green)' },
    { label: 'Listed', value: latestSnap?.listed ?? 0, width: 22, color: 'var(--green-dim)' },
  ];

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Dashboard</h1>
          <p className="app-page-sub">Southern California &middot; Live overview</p>
        </div>
        <div className="app-page-header-right">
          <div className="app-live-badge">
            <div className="app-live-dot"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="app-kpi-row">
        <div className="app-kpi-card">
          <div className="app-kpi-label">Pipeline Volume</div>
          <div className="app-kpi-value">{fmt$(totalVolume)}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Avg Seller Score</div>
          <div className="app-kpi-value">{avgScore}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">High Signals (90+)</div>
          <div className="app-kpi-value">{highSignals}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Active Campaigns</div>
          <div className="app-kpi-value">{activeCampaigns}</div>
          <div className="app-kpi-change">{totalSent.toLocaleString()} messages sent</div>
        </div>
      </div>

      {/* Two-col grid: top sellers + projected listings */}
      <div className="app-grid-2">
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Top Signals</h2>
            <Link to="/app/pipeline" className="app-card-link">View all</Link>
          </div>
          <div className="app-card-body">
            {topSellers.length === 0 ? (
              <EmptyState title="No sellers yet" description="Add sellers to your pipeline to see top signals." />
            ) : topSellers.map(s => (
              <Link to={`/app/pipeline/${s.id}`} className="app-mini-row" key={s.id}>
                <div className="app-mini-row-left">
                  <span className={`app-score-dot ${s.score >= 90 ? 'high' : s.score >= 85 ? 'mid' : 'low'}`}></span>
                  <div>
                    <div className="app-mini-row-title">{s.address}</div>
                    <div className="app-mini-row-sub">{s.city}</div>
                  </div>
                </div>
                <div className="app-mini-row-right">
                  <span className="app-mini-row-score">{s.score}</span>
                  <span className="app-mini-row-est">{fmt$(s.est)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Projected Listings (12 weeks)</h2>
            {chartTotal > 0 && <span className="app-card-badge">{chartTotal} total</span>}
          </div>
          <div className="app-card-body">
            {chartData.length === 0 ? (
              <EmptyState title="No data yet" description="Analytics snapshots will appear here." />
            ) : (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--gray-900)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(34,197,94,0.08)' }} />
                    <Bar dataKey="listings" fill="var(--green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-col grid: recent campaigns + conversion funnel */}
      <div className="app-grid-2">
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Recent Campaigns</h2>
            <Link to="/app/campaigns" className="app-card-link">View all</Link>
          </div>
          <div className="app-card-body">
            {recentCampaigns.length === 0 ? (
              <EmptyState title="No campaigns yet" description="Create your first campaign to get started." />
            ) : recentCampaigns.map(c => (
              <Link to={`/app/campaigns/${c.id}`} className="app-mini-row" key={c.id}>
                <div className="app-mini-row-left">
                  <span className={`app-status-dot ${c.status}`}></span>
                  <div>
                    <div className="app-mini-row-title">{c.name}</div>
                    <div className="app-mini-row-sub">{c.channel} &middot; {c.agent}</div>
                  </div>
                </div>
                <div className="app-mini-row-right">
                  <span className="app-mini-row-rate">{c.rate > 0 ? c.rate + '%' : '\u2014'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Conversion Funnel</h2>
          </div>
          <div className="app-card-body">
            <div className="app-funnel">
              {funnel.map((stage, i) => (
                <div className="app-funnel-stage" key={i}>
                  <div className="app-funnel-bar" style={{ width: stage.width + '%', background: stage.color }}></div>
                  <div className="app-funnel-info">
                    <span className="app-funnel-label">{stage.label}</span>
                    <span className="app-funnel-value">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
