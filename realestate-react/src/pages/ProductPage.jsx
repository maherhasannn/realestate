import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function ProductPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Nav activePage="product" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-tag">Product</div>
        <h1>A trading terminal for residential real estate</h1>
        <p className="hero-sub">Signal combines predictive analytics, automated outreach, authority content, and live pipeline visibility into a single platform built for modern brokerages.</p>
      </section>

      {/* Capabilities grid */}
      <section className="capabilities">
        <div className="capabilities-grid">
          <div className="cap-card">
            <div className="cap-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#22c55e" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div className="cap-title">Predictive scoring</div>
            <div className="cap-desc">Every homeowner scored on likelihood to sell in the next 90 days using 47 data streams.</div>
          </div>
          <div className="cap-card">
            <div className="cap-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 3 5-7" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="cap-title">Multi-channel outreach</div>
            <div className="cap-desc">Automated SMS, email, direct mail, and retargeting triggered by seller signals.</div>
          </div>
          <div className="cap-card">
            <div className="cap-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#22c55e" strokeWidth="1.5"/><path d="M5 7h6M5 10h4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div className="cap-title">Content generation</div>
            <div className="cap-desc">Hyperlocal market reports and seller guides generated for every micro-market.</div>
          </div>
          <div className="cap-card">
            <div className="cap-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="#22c55e" strokeWidth="1.5"/><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div className="cap-title">Agent assignment</div>
            <div className="cap-desc">Auto-route high-probability sellers to the right agent by geography and specialty.</div>
          </div>
          <div className="cap-card">
            <div className="cap-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="#22c55e" strokeWidth="1.5"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="#22c55e" strokeWidth="1.5"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="#22c55e" strokeWidth="1.5"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="#22c55e" strokeWidth="1.5"/></svg>
            </div>
            <div className="cap-title">Brokerage dashboard</div>
            <div className="cap-desc">Live pipeline view across every agent, region, and price point. No more spreadsheets.</div>
          </div>
          <div className="cap-card">
            <div className="cap-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4v8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div className="cap-title">API &amp; integrations</div>
            <div className="cap-desc">Connect to your MLS, CRM, and marketing stack via REST API and native integrations.</div>
          </div>
        </div>
      </section>

      {/* Deep dive 1: Predictive Engine */}
      <section className="deep-section">
        <div>
          <div className="deep-tag">Predictive engine</div>
          <div className="deep-title">Know who's selling before they list</div>
          <div className="deep-desc">Signal ingests 47 data streams and scores every homeowner on their likelihood to sell in the next 90 days. The model retrains weekly on actual listing outcomes.</div>
          <ul className="deep-list">
            <li><span className="deep-check">&#10003;</span> Public records, permits, mortgage events</li>
            <li><span className="deep-check">&#10003;</span> Behavioral signals (browsing, inquiry patterns)</li>
            <li><span className="deep-check">&#10003;</span> Life event triggers (divorce, probate, relocation)</li>
            <li><span className="deep-check">&#10003;</span> 94% accuracy on 90-day predictions</li>
            <li><span className="deep-check">&#10003;</span> Updated daily, retrains weekly</li>
          </ul>
        </div>
        <div className="mock-panel">
          <div className="mock-toolbar">
            <div className="mock-dots"><div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div></div>
            <div className="mock-label">Seller scores</div>
          </div>
          <div className="mock-body">
            <div className="mock-row"><span className="mock-row-label">1520 Benedict Cyn</span><span className="mock-row-value" style={{color:'var(--green)'}}>96</span></div>
            <div className="mock-row"><span className="mock-row-label">1847 Sunset Blvd</span><span className="mock-row-value" style={{color:'var(--green)'}}>94</span></div>
            <div className="mock-row"><span className="mock-row-label">330 Palisades Dr</span><span className="mock-row-value" style={{color:'var(--green)'}}>93</span></div>
            <div className="mock-row"><span className="mock-row-label">701 N Elm Dr</span><span className="mock-row-value" style={{color:'var(--green)'}}>92</span></div>
            <div className="mock-row"><span className="mock-row-label">3201 Ocean Ave</span><span className="mock-row-value" style={{color:'var(--green)'}}>91</span></div>
            <div className="mock-row">
              <span className="mock-row-label">Score distribution</span>
              <div className="mock-bar-track" style={{width:'120px'}}><div className="mock-bar-fill" style={{width:'78%'}}></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep dive 2: Outreach */}
      <section className="deep-section reverse" style={{borderTop:'1px solid var(--gray-100)'}}>
        <div>
          <div className="deep-tag">Automated outreach</div>
          <div className="deep-title">Launch campaigns without lifting a finger</div>
          <div className="deep-desc">When Signal identifies a high-probability seller, it triggers multi-channel sequences — personalized SMS, email, direct mail, and retargeting ads. All compliant, all trackable.</div>
          <ul className="deep-list">
            <li><span className="deep-check">&#10003;</span> Personalized SMS, email, and direct mail</li>
            <li><span className="deep-check">&#10003;</span> Retargeting ad campaigns on Meta + Google</li>
            <li><span className="deep-check">&#10003;</span> DNC / TCPA / CAN-SPAM compliant by default</li>
            <li><span className="deep-check">&#10003;</span> A/B testing built in</li>
            <li><span className="deep-check">&#10003;</span> Response tracking across all channels</li>
          </ul>
        </div>
        <div className="mock-panel">
          <div className="mock-toolbar">
            <div className="mock-dots"><div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div></div>
            <div className="mock-label">Campaigns</div>
          </div>
          <div className="mock-body">
            <div className="mock-stat-grid">
              <div className="mock-stat"><div className="mock-stat-value">428</div><div className="mock-stat-label">Active</div></div>
              <div className="mock-stat"><div className="mock-stat-value">14.2%</div><div className="mock-stat-label">Response rate</div></div>
              <div className="mock-stat"><div className="mock-stat-value">1,927</div><div className="mock-stat-label">Sent this week</div></div>
              <div className="mock-stat"><div className="mock-stat-value">239</div><div className="mock-stat-label">Replies</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep dive 3: Content */}
      <section className="deep-section" style={{borderTop:'1px solid var(--gray-100)'}}>
        <div>
          <div className="deep-tag">Authority content</div>
          <div className="deep-title">Hyperlocal content that builds trust</div>
          <div className="deep-desc">Signal generates market reports, neighborhood analyses, and seller guides tailored to each micro-market. Your agents become the local expert without writing a word.</div>
          <ul className="deep-list">
            <li><span className="deep-check">&#10003;</span> Monthly market reports per zip code</li>
            <li><span className="deep-check">&#10003;</span> Seller guides with local comps</li>
            <li><span className="deep-check">&#10003;</span> Neighborhood trend analyses</li>
            <li><span className="deep-check">&#10003;</span> Branded with your brokerage identity</li>
            <li><span className="deep-check">&#10003;</span> Auto-distributed via email and social</li>
          </ul>
        </div>
        <div className="mock-panel">
          <div className="mock-toolbar">
            <div className="mock-dots"><div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div></div>
            <div className="mock-label">Content library</div>
          </div>
          <div className="mock-body">
            <div className="mock-row"><span className="mock-row-label">Pacific Palisades Q2 Report</span><span className="mock-row-value" style={{color:'var(--green)'}}>Published</span></div>
            <div className="mock-row"><span className="mock-row-label">Beverly Hills Seller Guide</span><span className="mock-row-value" style={{color:'var(--green)'}}>Published</span></div>
            <div className="mock-row"><span className="mock-row-label">Malibu Market Trends</span><span className="mock-row-value" style={{color:'var(--green)'}}>Published</span></div>
            <div className="mock-row"><span className="mock-row-label">Brentwood Neighborhood Analysis</span><span className="mock-row-value" style={{color:'#ca8a04'}}>Draft</span></div>
            <div className="mock-row"><span className="mock-row-label">Hollywood Hills Comps Sheet</span><span className="mock-row-value" style={{color:'var(--gray-300)'}}>Scheduled</span></div>
          </div>
        </div>
      </section>

      {/* Deep dive 4: Brokerage view */}
      <section className="deep-section reverse" style={{borderTop:'1px solid var(--gray-100)'}}>
        <div>
          <div className="deep-tag">Brokerage view</div>
          <div className="deep-title">A live pipeline across your entire org</div>
          <div className="deep-desc">Leadership sees every opportunity, every campaign, every conversion in real time. Filter by agent, region, price point, or probability score.</div>
          <ul className="deep-list">
            <li><span className="deep-check">&#10003;</span> Real-time pipeline dashboard</li>
            <li><span className="deep-check">&#10003;</span> Filter by agent, region, price, score</li>
            <li><span className="deep-check">&#10003;</span> Conversion funnel analytics</li>
            <li><span className="deep-check">&#10003;</span> Commission projections</li>
            <li><span className="deep-check">&#10003;</span> Exportable reports for leadership</li>
          </ul>
        </div>
        <div className="mock-panel">
          <div className="mock-toolbar">
            <div className="mock-dots"><div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div></div>
            <div className="mock-label">Pipeline overview</div>
          </div>
          <div className="mock-body">
            <div className="mock-stat-grid">
              <div className="mock-stat"><div className="mock-stat-value">$486M</div><div className="mock-stat-label">Pipeline volume</div></div>
              <div className="mock-stat"><div className="mock-stat-value">$14.2M</div><div className="mock-stat-label">Projected commission</div></div>
            </div>
            <div className="mock-chart">
              {[40,52,45,67,58,73,62,80,77,90,85,100].map((h, i) => (
                <div key={i} className="mock-chart-bar" style={{height:`${h}%`}}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section className="data-section">
        <div className="data-inner">
          <div className="data-title">Data that powers Signal</div>
          <div className="data-grid">
            <div className="data-chip"><div className="data-chip-num">47</div><div className="data-chip-label">Data streams</div></div>
            <div className="data-chip"><div className="data-chip-num">340+</div><div className="data-chip-label">Zip codes</div></div>
            <div className="data-chip"><div className="data-chip-num">2.1M</div><div className="data-chip-label">Properties tracked</div></div>
            <div className="data-chip"><div className="data-chip-num">94%</div><div className="data-chip-label">Prediction accuracy</div></div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="integrations">
        <h2>Connects to your stack</h2>
        <p className="integrations-sub">Native integrations with the tools your brokerage already uses. Plus a REST API for anything custom.</p>
        <div className="integrations-logos">
          {['Salesforce','Follow Up Boss','KvCORE','BoomTown','Chime','Zapier','Mailchimp','Google Ads','Meta Ads','MLS (RETS/RESO)','REST API','Webhooks'].map(name => (
            <div key={name} className="int-logo">{name}</div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>See your market<br/>before everyone else</h2>
          <p>Signal is currently available for brokerages with 10+ agents in select California markets.</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn-primary-lg">Start free trial</Link>
            <button className="btn-secondary-lg">Book a demo</button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
