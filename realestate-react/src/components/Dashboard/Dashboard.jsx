import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { sellers } from '../../data/sellers';
import { campaigns, weeklyListings, weekLabels } from '../../data/campaigns';
import PipelineTab from './PipelineTab';
import CampaignsTab from './CampaignsTab';
import AnalyticsTab from './AnalyticsTab';

const Dashboard = forwardRef(function Dashboard(props, ref) {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;
  const dashboardElRef = useRef(null);

  function getFiltered() {
    let list = [...sellers];
    if (activeFilter === 'high') list = list.filter(s => s.score >= 90);
    if (activeFilter === 'outreach') list = list.filter(s => s.inOutreach);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.trigger.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }

  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = currentPage >= totalPages ? Math.max(0, totalPages - 1) : currentPage;

  useImperativeHandle(ref, () => ({
    highlightSeller(id) {
      setActiveTab('pipeline');
      setActiveFilter('all');
      setSearchQuery('');
      setExpandedRow(id);

      // Find page for this seller
      const sorted = [...sellers].sort((a, b) => {
        let av = a[sortCol], bv = b[sortCol];
        if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
      const idx = sorted.findIndex(s => s.id === id);
      if (idx >= 0) setCurrentPage(Math.floor(idx / pageSize));

      setTimeout(() => {
        const row = document.querySelector(`.dashboard-row[data-id="${id}"]`);
        if (row) {
          row.style.transition = 'background 0.5s ease, box-shadow 0.5s ease, border-color 0.3s ease';
          row.style.background = 'var(--green-bg-strong)';
          row.style.boxShadow = '0 0 0 1px rgba(34,197,94,0.2), 0 4px 16px rgba(34,197,94,0.08)';
          row.style.borderLeft = '3px solid var(--green)';
          row.style.borderRadius = '8px';
          setTimeout(() => {
            row.style.transition = 'background 1s ease, box-shadow 1s ease, border-color 1s ease';
            row.style.background = '';
            row.style.boxShadow = '';
            row.style.borderLeft = '';
            row.style.borderRadius = '';
          }, 2000);
        }
      }, 500);
    },
  }));

  function handleFilterChange(key) {
    setActiveFilter(key);
    setExpandedRow(null);
    setCurrentPage(0);
  }

  function handleSearchChange(val) {
    setSearchQuery(val);
    setExpandedRow(null);
    setCurrentPage(0);
  }

  function handleSortChange(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'address' || col === 'city' || col === 'trigger' ? 'asc' : 'desc');
    }
  }

  function handleRowClick(id) {
    setExpandedRow(prev => prev === id ? null : id);
  }

  function handlePageChange(dir) {
    setExpandedRow(null);
    setCurrentPage(p => dir === 'next' ? p + 1 : p - 1);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setExpandedRow(null);
    setCurrentPage(0);
  }

  return (
    <section style={{ padding: '0 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="dashboard" ref={dashboardElRef} style={{ maxWidth: '960px', width: '100%' }}>
        <div className="dashboard-toolbar">
          <div className="dashboard-tabs">
            {['pipeline', 'campaigns', 'analytics'].map(t => (
              <button
                key={t}
                className={`dashboard-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => handleTabChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="dashboard-live">
            <div className="dashboard-live-dot"></div>
            <span className="dashboard-live-text">LIVE</span>
          </div>
        </div>

        {activeTab === 'pipeline' && (
          <PipelineTab
            sellers={filtered}
            allSellers={sellers}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            sortCol={sortCol}
            sortDir={sortDir}
            expandedRow={expandedRow}
            currentPage={safePage}
            pageSize={pageSize}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onRowClick={handleRowClick}
            onPageChange={handlePageChange}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsTab campaigns={campaigns} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            sellers={sellers}
            weeklyListings={weeklyListings}
            weekLabels={weekLabels}
          />
        )}
      </div>
    </section>
  );
});

export default Dashboard;
