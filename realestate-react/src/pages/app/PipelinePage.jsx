import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellers } from '../../hooks/useSellers';
import { fmt$ } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function scoreColor(s) {
  return s >= 90 ? 'var(--green)' : s >= 85 ? 'var(--gray-500)' : 'var(--gray-400)';
}

export default function PipelinePage() {
  const { data: sellers, loading } = useSellers();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('score');
  const [sortDir, setSortDir] = useState('desc');

  if (loading) return <LoadingSpinner />;

  function getFiltered() {
    let list = [...sellers];
    if (filter === 'high') list = list.filter(s => s.score >= 90);
    if (filter === 'outreach') list = list.filter(s => s.inOutreach);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.trigger && s.trigger.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }

  const filtered = getFiltered();

  const q = search ? search.toLowerCase() : '';
  const match = s => !q || s.address.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || (s.trigger && s.trigger.toLowerCase().includes(q));
  const counts = {
    all: sellers.filter(match).length,
    high: sellers.filter(s => s.score >= 90 && match(s)).length,
    outreach: sellers.filter(s => s.inOutreach && match(s)).length,
  };

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'address' || col === 'city' || col === 'trigger' ? 'asc' : 'desc');
    }
  }

  const arrow = (col) =>
    sortCol === col ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : null;

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Pipeline</h1>
          <p className="app-page-sub">{sellers.length} sellers &middot; {sellers.filter(s => s.score >= 90).length} high-signal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="app-filters">
        {[
          { key: 'all', label: 'All signals' },
          { key: 'high', label: '90+ score' },
          { key: 'outreach', label: 'In outreach' },
        ].map(f => (
          <button
            key={f.key}
            className={`app-filter-pill${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className="app-filter-count">{counts[f.key]}</span>
          </button>
        ))}
        <input
          className="app-search"
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {sellers.length === 0 ? (
        <EmptyState
          title="No sellers in pipeline"
          description="Add your first seller to start tracking signals."
          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>}
        />
      ) : (
        <>
          {/* Table */}
          <div className="app-table-wrap">
            <div className="app-table-header">
              <span className="col-property" onClick={() => handleSort('address')}>Property {arrow('address') && <span className="sort-arrow">{arrow('address')}</span>}</span>
              <span className="col-market" onClick={() => handleSort('city')}>Market {arrow('city') && <span className="sort-arrow">{arrow('city')}</span>}</span>
              <span className="col-score" onClick={() => handleSort('score')}>Score {arrow('score') && <span className="sort-arrow">{arrow('score')}</span>}</span>
              <span className="col-value" onClick={() => handleSort('est')}>Est. Value {arrow('est') && <span className="sort-arrow">{arrow('est')}</span>}</span>
              <span className="col-signal" onClick={() => handleSort('trigger')}>Signal {arrow('trigger') && <span className="sort-arrow">{arrow('trigger')}</span>}</span>
              <span className="col-days" onClick={() => handleSort('days')}>Days {arrow('days') && <span className="sort-arrow">{arrow('days')}</span>}</span>
              <span className="col-status">Status</span>
            </div>

            <div className="app-table-body">
              {filtered.length === 0 && (
                <div className="app-table-empty">No sellers match your filters.</div>
              )}
              {filtered.map(s => (
                <Link to={`/app/pipeline/${s.id}`} className="app-table-row" key={s.id}>
                  <span className="col-property">
                    <span className="app-table-address">{s.address}</span>
                  </span>
                  <span className="col-market">{s.city}</span>
                  <span className="col-score">
                    <span className="app-score-bar-wrap">
                      <span className="app-score-bar"><span className="app-score-bar-fill" style={{ width: s.score + '%', background: scoreColor(s.score) }}></span></span>
                      <span style={{ color: scoreColor(s.score), fontFamily: 'var(--mono)', fontWeight: 500 }}>{s.score}</span>
                    </span>
                  </span>
                  <span className="col-value">{fmt$(s.est)}</span>
                  <span className="col-signal">{s.trigger}</span>
                  <span className="col-days">{s.days}d</span>
                  <span className="col-status">
                    {s.inOutreach
                      ? <span className="app-status-pill active">Active</span>
                      : <span className="app-status-pill idle">Not started</span>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
