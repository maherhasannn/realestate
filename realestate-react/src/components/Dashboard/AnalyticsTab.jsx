import { fmt$ } from '../../utils/format';

export default function AnalyticsTab({ sellers, weeklyListings, weekLabels }) {
  const totalVolume = sellers.reduce((a, s) => a + s.est, 0);
  const avgScore = (sellers.reduce((a, s) => a + s.score, 0) / sellers.length).toFixed(1);
  const maxWeekly = Math.max(...weeklyListings);

  return (
    <>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-title">Pipeline Volume</div>
          <div className="analytics-big-num">{fmt$(totalVolume)}</div>
          <div className="analytics-change up">{'\u25B2'} 12.4% vs last month</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Avg Seller Score</div>
          <div className="analytics-big-num">{avgScore}</div>
          <div className="analytics-change up">{'\u25B2'} 2.1 pts vs last month</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Projected Listings (12 weeks)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="analytics-big-num">{weeklyListings.reduce((a, b) => a + b, 0)}</div>
              <div className="analytics-change up">{'\u25B2'} 8.3% vs prior period</div>
            </div>
          </div>
          <div className="mini-chart">
            {weeklyListings.map((v, i) => (
              <div
                key={i}
                className="mini-chart-bar"
                style={{ height: `${(v / maxWeekly * 100)}%` }}
              >
                <div className="mini-chart-bar-tooltip">{weekLabels[i]}: {v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Conversion Funnel</div>
          <div className="pipeline-funnel">
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: '100%', background: 'var(--gray-200)' }}></div>
              <div className="funnel-label">Identified</div>
              <div className="funnel-value">1,284</div>
            </div>
            <div className="funnel-arrow">{'\u2192'}</div>
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: '72%', background: 'var(--green-bg-strong)', margin: '0 auto 6px' }}></div>
              <div className="funnel-label">Contacted</div>
              <div className="funnel-value">428</div>
            </div>
            <div className="funnel-arrow">{'\u2192'}</div>
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: '44%', background: 'var(--green)', margin: '0 auto 6px' }}></div>
              <div className="funnel-label">Responded</div>
              <div className="funnel-value">187</div>
            </div>
            <div className="funnel-arrow">{'\u2192'}</div>
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: '22%', background: 'var(--green-dim)', margin: '0 auto 6px' }}></div>
              <div className="funnel-label">Listed</div>
              <div className="funnel-value">64</div>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-footer">
        <span className="showing">Southern California &middot; Last 90 days</span>
        <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--gray-400)' }}>Updated 2m ago</span>
      </div>
    </>
  );
}
