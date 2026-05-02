import { useParams, Link } from 'react-router-dom';
import { useSeller } from '../../hooks/useSeller';
import { fmt$ } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function scoreCls(s) {
  return s >= 90 ? 'high' : s >= 85 ? 'mid' : 'low';
}

export default function SellerDetailPage() {
  const { id } = useParams();
  const { data: seller, activity, campaigns: relatedCampaigns, loading, error } = useSeller(id);

  if (loading) return <LoadingSpinner />;

  if (error || !seller) {
    return (
      <div className="app-page">
        <div className="app-page-header">
          <div>
            <Link to="/app/pipeline" className="app-back-link">&larr; Back to pipeline</Link>
            <h1 className="app-page-title">Seller not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const mortgageNum = parseFloat((seller.mortgageBalance || '0').replace(/[^0-9.]/g, ''));
  const mortgageVal = seller.mortgageBalance && seller.mortgageBalance.includes('M') ? mortgageNum * 1000000 : mortgageNum * 1000;
  const equity = Math.max(0, seller.est - (mortgageVal || 0));

  // Use activity log from DB, or show empty
  const timeline = activity.length > 0
    ? activity.map(a => ({ date: a.date, event: a.event, type: a.type || 'score' }))
    : [];

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <Link to="/app/pipeline" className="app-back-link">&larr; Pipeline</Link>
          <h1 className="app-page-title">{seller.address}</h1>
          <p className="app-page-sub">{seller.city}</p>
        </div>
        <div className="app-page-header-right">
          <span className={`app-score-badge ${scoreCls(seller.score)}`}>
            Score: {seller.score}
          </span>
          {seller.inOutreach
            ? <span className="app-status-pill active">In outreach</span>
            : <button className="app-btn-primary">Start outreach</button>}
        </div>
      </div>

      {/* Top stat cards */}
      <div className="app-kpi-row app-kpi-row-6">
        <div className="app-kpi-card compact">
          <div className="app-kpi-label">Est. Value</div>
          <div className="app-kpi-value">{fmt$(seller.est)}</div>
        </div>
        <div className="app-kpi-card compact">
          <div className="app-kpi-label">Property</div>
          <div className="app-kpi-value sm">{seller.beds}bd / {seller.baths}ba &middot; {(seller.sqft || 0).toLocaleString()} sqft</div>
        </div>
        <div className="app-kpi-card compact">
          <div className="app-kpi-label">Year Built</div>
          <div className="app-kpi-value">{seller.yearBuilt}</div>
        </div>
        <div className="app-kpi-card compact">
          <div className="app-kpi-label">Lot</div>
          <div className="app-kpi-value sm">{seller.lot}</div>
        </div>
        <div className="app-kpi-card compact">
          <div className="app-kpi-label">Owner Since</div>
          <div className="app-kpi-value">{seller.ownerSince}</div>
        </div>
        <div className="app-kpi-card compact">
          <div className="app-kpi-label">Est. Equity</div>
          <div className="app-kpi-value" style={{ color: 'var(--green)' }}>{fmt$(equity)}</div>
        </div>
      </div>

      <div className="app-grid-2">
        {/* Left: property details */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Property Details</h2>
          </div>
          <div className="app-card-body">
            <div className="app-art-placeholder" style={{ marginBottom: 20, height: 200 }}>
              <div className="app-art-placeholder-inner">
                <div className="app-art-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
                <span>Property photo / Street View</span>
              </div>
            </div>

            <div className="app-detail-grid">
              <div className="app-detail-item">
                <span className="app-detail-label">Address</span>
                <span className="app-detail-value">{seller.address}, {seller.city}</span>
              </div>
              <div className="app-detail-item">
                <span className="app-detail-label">Mortgage Balance</span>
                <span className="app-detail-value">{seller.mortgageBalance}</span>
              </div>
              <div className="app-detail-item">
                <span className="app-detail-label">Last Sale</span>
                <span className="app-detail-value">{seller.lastSale}</span>
              </div>
              <div className="app-detail-item">
                <span className="app-detail-label">Signal</span>
                <span className="app-detail-value" style={{ color: 'var(--green)' }}>{seller.trigger}</span>
              </div>
              <div className="app-detail-item">
                <span className="app-detail-label">Days in Pipeline</span>
                <span className="app-detail-value">{seller.days}d</span>
              </div>
              <div className="app-detail-item">
                <span className="app-detail-label">Assigned Agent</span>
                <span className="app-detail-value">{seller.agent || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: signal timeline */}
        <div className="app-card">
          <div className="app-card-header">
            <h2 className="app-card-title">Signal Timeline</h2>
          </div>
          <div className="app-card-body">
            {timeline.length === 0 ? (
              <EmptyState title="No activity yet" description="Events will appear here as signals are tracked." />
            ) : (
              <div className="app-timeline">
                {timeline.map((t, i) => (
                  <div className="app-timeline-item" key={i}>
                    <div className="app-timeline-dot-wrap">
                      <div className={`app-timeline-dot ${t.type}`}></div>
                      {i < timeline.length - 1 && <div className="app-timeline-line"></div>}
                    </div>
                    <div className="app-timeline-content">
                      <div className="app-timeline-event">{t.event}</div>
                      <div className="app-timeline-date">{t.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {relatedCampaigns.length > 0 && (
            <>
              <div className="app-card-header" style={{ borderTop: '1px solid var(--gray-100)' }}>
                <h2 className="app-card-title">Related Campaigns</h2>
              </div>
              <div className="app-card-body">
                {relatedCampaigns.map(c => (
                  <Link to={`/app/campaigns/${c.id}`} className="app-mini-row" key={c.id}>
                    <div className="app-mini-row-left">
                      <span className={`app-status-dot ${c.status}`}></span>
                      <div>
                        <div className="app-mini-row-title">{c.name}</div>
                        <div className="app-mini-row-sub">{c.channel}</div>
                      </div>
                    </div>
                    <div className="app-mini-row-right">
                      <span className="app-mini-row-rate">{c.rate > 0 ? c.rate + '%' : '\u2014'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
