export default function CampaignsTab({ campaigns }) {
  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalResp = campaigns.reduce((a, c) => a + c.responses, 0);

  return (
    <>
      <div className="campaign-header-row">
        <span>Campaign</span>
        <span>Channel</span>
        <span>Status</span>
        <span>Sent</span>
        <span>Replies</span>
        <span>Rate</span>
      </div>

      {campaigns.map((c, i) => (
        <div className="campaign-row" key={i}>
          <span className="campaign-name">{c.name}</span>
          <span className="campaign-channel">{c.channel}</span>
          <span className={`campaign-status ${c.status}`}>{c.status}</span>
          <span className="campaign-stat">{c.sent.toLocaleString()}</span>
          <span className="campaign-stat">{c.responses}</span>
          <span
            className="campaign-rate"
            style={{ color: c.rate >= 10 ? 'var(--green)' : 'var(--gray-500)' }}
          >
            {c.rate > 0 ? c.rate + '%' : '\u2014'}
          </span>
        </div>
      ))}

      <div className="dashboard-footer">
        <span className="showing">
          {campaigns.filter(c => c.status === 'active').length} active campaigns &middot; {totalSent.toLocaleString()} messages sent
        </span>
        <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 500 }}>
          {(totalResp / totalSent * 100).toFixed(1)}% avg response
        </span>
      </div>
    </>
  );
}
