function fmt$(v) {
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
  return '$' + v;
}

function scoreColor(s) {
  return s >= 90 ? 'var(--green)' : s >= 85 ? 'var(--gray-500)' : 'var(--gray-400)';
}

export default function PipelineTab({
  sellers,
  allSellers,
  activeFilter,
  searchQuery,
  sortCol,
  sortDir,
  expandedRow,
  currentPage,
  pageSize,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onRowClick,
  onPageChange,
}) {
  const filtered = sellers;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const arrow = (col) =>
    sortCol === col ? (sortDir === 'asc' ? <span className="sort-arrow">{'\u25B2'}</span> : <span className="sort-arrow">{'\u25BC'}</span>) : null;

  // Filter counts
  const q = searchQuery ? searchQuery.toLowerCase() : '';
  const match = s => !q || s.address.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.trigger.toLowerCase().includes(q);
  const counts = {
    all: allSellers.filter(match).length,
    high: allSellers.filter(s => s.score >= 90 && match(s)).length,
    outreach: allSellers.filter(s => s.inOutreach && match(s)).length,
  };

  const filters = [
    { key: 'all', label: 'All signals' },
    { key: 'high', label: '90+ score' },
    { key: 'outreach', label: 'In outreach' },
  ];

  return (
    <>
      <div className="dashboard-filters">
        {filters.map(f => (
          <button
            key={f.key}
            className={`filter-pill${activeFilter === f.key ? ' active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label} <span className="count">{counts[f.key].toLocaleString()}</span>
          </button>
        ))}
        <input
          className="dashboard-search"
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="dashboard-header-row">
        <span data-sort="address" onClick={() => onSortChange('address')}>Property {arrow('address')}</span>
        <span className="col-city" data-sort="city" onClick={() => onSortChange('city')}>Market {arrow('city')}</span>
        <span data-sort="score" onClick={() => onSortChange('score')}>Score {arrow('score')}</span>
        <span data-sort="est" onClick={() => onSortChange('est')}>Est. Value {arrow('est')}</span>
        <span className="col-signal" data-sort="trigger" onClick={() => onSortChange('trigger')}>Signal {arrow('trigger')}</span>
        <span data-sort="days" onClick={() => onSortChange('days')}>Days {arrow('days')}</span>
      </div>

      <div className="dashboard-body">
        {pageItems.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--gray-300)', fontSize: '13px' }}>
            No sellers match your filters.
          </div>
        )}
        {pageItems.map(s => {
          const isExpanded = expandedRow === s.id;
          const equity = Math.max(0, s.est - (parseFloat(s.mortgageBalance.replace(/[^0-9.]/g, '')) * 1000000 || 0));
          return (
            <div key={s.id}>
              <div
                className={`dashboard-row${isExpanded ? ' expanded' : ''}`}
                data-id={s.id}
                onClick={() => onRowClick(s.id)}
              >
                <span className="address">{s.address}</span>
                <span className="city">{s.city}</span>
                <div className="score-cell">
                  <div className="score-bar">
                    <div className="score-bar-fill" style={{ width: `${s.score}%`, background: scoreColor(s.score) }}></div>
                  </div>
                  <span className="score-num" style={{ color: scoreColor(s.score) }}>{s.score}</span>
                </div>
                <span className="est">{fmt$(s.est)}</span>
                <span className="trigger">{s.trigger}</span>
                <span className="days">{s.days}d</span>
              </div>

              <div className={`row-detail${isExpanded ? ' open' : ''}`} data-detail={s.id}>
                <div className="row-detail-grid">
                  <div className="detail-card">
                    <div className="detail-card-label">Property</div>
                    <div className="detail-card-value">{s.beds}bd / {s.baths}ba &middot; {s.sqft.toLocaleString()} sqft</div>
                    <div className="detail-card-sub">Built {s.yearBuilt} &middot; Lot {s.lot}</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-card-label">Ownership</div>
                    <div className="detail-card-value">Since {s.ownerSince}</div>
                    <div className="detail-card-sub">Last sale: {s.lastSale}</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-card-label">Mortgage</div>
                    <div className="detail-card-value">{s.mortgageBalance}</div>
                    <div className="detail-card-sub">Est. equity: {fmt$(equity)}</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-card-label">Outreach</div>
                    <div className="detail-card-value" style={{ color: s.inOutreach ? 'var(--green)' : 'var(--gray-400)' }}>
                      {s.inOutreach ? 'Active' : 'Not started'}
                    </div>
                    <div className="detail-card-sub">{s.agent ? 'Agent: ' + s.agent : 'Unassigned'}</div>
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="detail-btn detail-btn-primary">{s.inOutreach ? 'View campaign' : 'Start outreach'}</button>
                  <button className="detail-btn detail-btn-secondary">Property report</button>
                  <button className="detail-btn detail-btn-secondary">Owner profile</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-footer">
        <span className="showing">
          Showing {filtered.length === 0 ? 0 : currentPage * pageSize + 1}&ndash;{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length} sellers
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentPage > 0 && (
            <button className="view-all" onClick={() => onPageChange('prev')}>&larr; Prev</button>
          )}
          {(currentPage + 1) < totalPages && (
            <button className="view-all" onClick={() => onPageChange('next')}>Next &rarr;</button>
          )}
        </div>
      </div>
    </>
  );
}
