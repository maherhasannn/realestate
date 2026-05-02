import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSellers } from '../../hooks/useSellers';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAnalytics } from '../../hooks/useAnalytics';
import { fmt$ } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function AnalyticsPage() {
  const { data: sellers, loading: sellersLoading } = useSellers();
  const { data: campaigns, loading: campaignsLoading } = useCampaigns();
  const { snapshots, loading: analyticsLoading } = useAnalytics();

  const loading = sellersLoading || campaignsLoading || analyticsLoading;
  if (loading) return <LoadingSpinner />;

  const totalVolume = sellers.reduce((a, s) => a + s.est, 0);
  const avgScore = sellers.length ? (sellers.reduce((a, s) => a + s.score, 0) / sellers.length).toFixed(1) : '0';
  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalResp = campaigns.reduce((a, c) => a + c.responses, 0);

  // Chart data from snapshots
  const chartData = snapshots.map(s => ({
    week: s.weekLabel,
    listings: s.projectedListings,
  }));
  const chartTotal = chartData.reduce((a, d) => a + d.listings, 0);

  // Funnel from latest snapshot
  const latestSnap = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const funnel = [
    { label: 'Identified', value: latestSnap?.identified ?? sellers.length, width: 100, color: 'var(--gray-200)' },
    { label: 'Contacted', value: latestSnap?.contacted ?? sellers.filter(s => s.inOutreach).length, width: 72, color: 'var(--green-bg-strong)' },
    { label: 'Responded', value: latestSnap?.responded ?? totalResp, width: 44, color: 'var(--green)' },
    { label: 'Listed', value: latestSnap?.listed ?? 0, width: 22, color: 'var(--green-dim)' },
  ];

  // Funnel trend line chart
  const funnelTrend = snapshots.map(s => ({
    week: s.weekLabel,
    identified: s.identified,
    contacted: s.contacted,
    responded: s.responded,
    listed: s.listed,
  }));

  // Agent breakdown
  const agents = {};
  sellers.forEach(s => {
    if (!s.agent) return;
    if (!agents[s.agent]) agents[s.agent] = { name: s.agent, sellers: 0, volume: 0, scores: [] };
    agents[s.agent].sellers++;
    agents[s.agent].volume += s.est;
    agents[s.agent].scores.push(s.score);
  });
  const agentList = Object.values(agents).map(a => ({
    ...a,
    avgScore: (a.scores.reduce((x, y) => x + y, 0) / a.scores.length).toFixed(0),
  }));

  // Market breakdown
  const markets = {};
  sellers.forEach(s => {
    if (!markets[s.city]) markets[s.city] = { name: s.city, count: 0, volume: 0 };
    markets[s.city].count++;
    markets[s.city].volume += s.est;
  });
  const marketList = Object.values(markets).sort((a, b) => b.volume - a.volume);

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Analytics</h1>
          <p className="app-page-sub">Southern California &middot; Last 90 days</p>
        </div>
      </div>

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
          <div className="app-kpi-label">Messages Sent</div>
          <div className="app-kpi-value">{totalSent.toLocaleString()}</div>
        </div>
        <div className="app-kpi-card">
          <div className="app-kpi-label">Avg Response Rate</div>
          <div className="app-kpi-value" style={{ color: 'var(--green)' }}>{totalSent > 0 ? (totalResp / totalSent * 100).toFixed(1) : '0.0'}%</div>
        </div>
      </div>

      <div className="app-grid-2">
        {/* Projected listings chart */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Projected Listings (12 weeks)</h2>
            {chartTotal > 0 && <span className="app-card-badge">{chartTotal} total</span>}
          </div>
          <div className="app-card-body">
            {chartData.length === 0 ? (
              <EmptyState title="No snapshot data" description="Add analytics snapshots to see projected listings." />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
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

        {/* Conversion funnel */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Conversion Funnel</h2>
          </div>
          <div className="app-card-body">
            <div className="app-funnel large">
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

            {funnelTrend.length > 0 ? (
              <div style={{ width: '100%', height: 140, marginTop: 20 }}>
                <ResponsiveContainer>
                  <LineChart data={funnelTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--gray-900)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                    <Line type="monotone" dataKey="identified" stroke="var(--gray-400)" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="contacted" stroke="var(--green)" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="responded" stroke="var(--green-dim)" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="listed" stroke="var(--green-bright)" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="app-art-placeholder" style={{ height: 120, marginTop: 20 }}>
                <div className="app-art-placeholder-inner">
                  <span>Funnel trend will appear with data</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="app-grid-2">
        {/* Agent performance */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Agent Performance</h2>
          </div>
          <div className="app-card-body">
            {agentList.length === 0 ? (
              <EmptyState title="No agent data" description="Assign agents to sellers to see performance." />
            ) : (
              <div className="app-table-wrap inline">
                <div className="app-table-header agent-grid">
                  <span>Agent</span>
                  <span>Sellers</span>
                  <span>Volume</span>
                  <span>Avg Score</span>
                </div>
                <div className="app-table-body">
                  {agentList.map(a => (
                    <div className="app-table-row agent-grid" key={a.name}>
                      <span className="app-table-address">{a.name}</span>
                      <span className="app-table-mono">{a.sellers}</span>
                      <span className="app-table-mono">{fmt$(a.volume)}</span>
                      <span className="app-table-mono" style={{ color: Number(a.avgScore) >= 90 ? 'var(--green)' : undefined }}>{a.avgScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Market breakdown */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Market Breakdown</h2>
          </div>
          <div className="app-card-body">
            {marketList.length === 0 ? (
              <EmptyState title="No market data" description="Add sellers to see market breakdown." />
            ) : (
              <div className="app-table-wrap inline">
                <div className="app-table-header market-grid">
                  <span>Market</span>
                  <span>Sellers</span>
                  <span>Volume</span>
                </div>
                <div className="app-table-body">
                  {marketList.map(m => (
                    <div className="app-table-row market-grid" key={m.name}>
                      <span className="app-table-address">{m.name}</span>
                      <span className="app-table-mono">{m.count}</span>
                      <span className="app-table-mono">{fmt$(m.volume)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
