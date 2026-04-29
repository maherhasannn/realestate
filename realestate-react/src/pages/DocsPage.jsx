import { useState, useEffect, useRef, useCallback } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [openEndpoint, setOpenEndpoint] = useState(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    function onScroll() {
      let current = 'quickstart';
      for (const el of sectionsRef.current) {
        if (el && window.scrollY >= el.offsetTop - 120) {
          current = el.id;
        }
      }
      setActiveSection(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const setSectionRef = useCallback((el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  }, []);

  function handleCopy(e) {
    const block = e.target.closest('.code-block');
    const code = block.querySelector('.code-body').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = e.target;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  }

  function toggleEndpoint(id) {
    setOpenEndpoint(openEndpoint === id ? null : id);
  }

  return (
    <>
      <Nav activePage="docs" />

      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Getting started</div>
            <a className={`sidebar-link${activeSection === 'quickstart' ? ' active' : ''}`} href="#quickstart">Quickstart</a>
            <a className={`sidebar-link${activeSection === 'authentication' ? ' active' : ''}`} href="#authentication">Authentication</a>
            <a className={`sidebar-link${activeSection === 'rate-limits' ? ' active' : ''}`} href="#rate-limits">Rate limits</a>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">API Reference</div>
            <a className={`sidebar-link${activeSection === 'sellers' ? ' active' : ''}`} href="#sellers">Sellers</a>
            <a className={`sidebar-link${activeSection === 'campaigns' ? ' active' : ''}`} href="#campaigns">Campaigns</a>
            <a className={`sidebar-link${activeSection === 'content' ? ' active' : ''}`} href="#content">Content</a>
            <a className={`sidebar-link${activeSection === 'webhooks' ? ' active' : ''}`} href="#webhooks">Webhooks</a>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Guides</div>
            <a className={`sidebar-link${activeSection === 'crm-integration' ? ' active' : ''}`} href="#crm-integration">CRM integration</a>
            <a className={`sidebar-link${activeSection === 'data-model' ? ' active' : ''}`} href="#data-model">Data model</a>
          </div>
        </aside>

        {/* Content */}
        <main className="docs-content">

          {/* Quickstart */}
          <section className="doc-section" id="quickstart" ref={setSectionRef}>
            <h2>Quickstart</h2>
            <p>Get up and running with the Signal API in under five minutes. The API gives you programmatic access to seller scores, campaigns, content, and pipeline data.</p>

            <h3>1. Get your API key</h3>
            <p>Navigate to <strong>Settings &rarr; API</strong> in your Signal dashboard and generate a new key. Store it securely — it won't be shown again.</p>

            <h3>2. Make your first request</h3>
            <p>Fetch your top-scoring sellers with a single call:</p>

            <div className="code-block">
              <div className="code-header">
                <span className="code-lang">bash</span>
                <button className="code-copy" onClick={handleCopy}>Copy</button>
              </div>
              <div className="code-body">{'curl https://api.signal.re/v1/sellers \\\n  -H '}<span className="cm-str">"Authorization: Bearer sk_live_..."</span>{' \\\n  -d '}<span className="cm-str">{'\'{"min_score": 90, "limit": 10}\''}</span></div>
            </div>

            <h3>3. Parse the response</h3>
            <div className="code-block">
              <div className="code-header">
                <span className="code-lang">json</span>
                <button className="code-copy" onClick={handleCopy}>Copy</button>
              </div>
              <div className="code-body">{'{\n  '}<span className="cm-key">"data"</span>{': [\n    {\n      '}<span className="cm-key">"id"</span>{': '}<span className="cm-str">"sel_1a2b3c"</span>{',\n      '}<span className="cm-key">"address"</span>{': '}<span className="cm-str">"1847 Sunset Blvd"</span>{',\n      '}<span className="cm-key">"city"</span>{': '}<span className="cm-str">"Pacific Palisades"</span>{',\n      '}<span className="cm-key">"score"</span>{': '}<span className="cm-num">94</span>{',\n      '}<span className="cm-key">"estimated_value"</span>{': '}<span className="cm-num">4200000</span>{',\n      '}<span className="cm-key">"trigger"</span>{': '}<span className="cm-str">"Divorce filing"</span>{',\n      '}<span className="cm-key">"days_on_signal"</span>{': '}<span className="cm-num">12</span>{'\n    }\n  ],\n  '}<span className="cm-key">"has_more"</span>{': '}<span className="cm-kw">true</span>{',\n  '}<span className="cm-key">"total"</span>{': '}<span className="cm-num">312</span>{'\n}'}</div>
            </div>
          </section>

          <hr className="doc-divider" />

          {/* Authentication */}
          <section className="doc-section" id="authentication" ref={setSectionRef}>
            <h2>Authentication</h2>
            <p>All API requests require a valid API key sent via the <code>Authorization</code> header using Bearer authentication.</p>

            <div className="code-block">
              <div className="code-header"><span className="code-lang">http</span><button className="code-copy" onClick={handleCopy}>Copy</button></div>
              <div className="code-body">Authorization: Bearer sk_live_your_api_key_here</div>
            </div>

            <p>Keys are scoped to your brokerage. You can create multiple keys with different permissions in the dashboard. Test keys (prefixed <code>sk_test_</code>) hit a sandbox with sample data.</p>
          </section>

          <hr className="doc-divider" />

          {/* Rate limits */}
          <section className="doc-section" id="rate-limits" ref={setSectionRef}>
            <h2>Rate limits</h2>
            <p>The API enforces rate limits per key to ensure platform stability.</p>
            <table className="param-table">
              <thead><tr><th>Plan</th><th>Limit</th><th>Burst</th></tr></thead>
              <tbody>
                <tr><td>Starter</td><td>100 req/min</td><td>20 req/sec</td></tr>
                <tr><td>Pro</td><td>500 req/min</td><td>50 req/sec</td></tr>
                <tr><td>Enterprise</td><td>Custom</td><td>Custom</td></tr>
              </tbody>
            </table>
            <p>Rate limit headers are included in every response: <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>. When exceeded, the API returns <code>429 Too Many Requests</code>.</p>
          </section>

          <hr className="doc-divider" />

          {/* Sellers */}
          <section className="doc-section" id="sellers" ref={setSectionRef}>
            <h2>Sellers</h2>
            <p>The sellers endpoint gives you access to Signal's predictive scoring data — every homeowner scored on their likelihood to sell.</p>

            <div className={`endpoint${openEndpoint === 'get-sellers' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('get-sellers')}>
                <span className="endpoint-method get">GET</span>
                <span className="endpoint-path">/v1/sellers</span>
                <span className="endpoint-desc">List scored sellers</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Returns a paginated list of sellers matching the given filters, sorted by score descending by default.</p>
                  <table className="param-table">
                    <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                      <tr><td><span className="param-name">min_score</span></td><td><span className="param-type">integer</span></td><td className="param-desc">Minimum seller score (0-100)</td></tr>
                      <tr><td><span className="param-name">city</span></td><td><span className="param-type">string</span></td><td className="param-desc">Filter by city name</td></tr>
                      <tr><td><span className="param-name">trigger</span></td><td><span className="param-type">string</span></td><td className="param-desc">Filter by trigger event type</td></tr>
                      <tr><td><span className="param-name">in_outreach</span></td><td><span className="param-type">boolean</span></td><td className="param-desc">Only return sellers with active outreach</td></tr>
                      <tr><td><span className="param-name">limit</span></td><td><span className="param-type">integer</span></td><td className="param-desc">Results per page (default 25, max 100)</td></tr>
                      <tr><td><span className="param-name">cursor</span></td><td><span className="param-type">string</span></td><td className="param-desc">Pagination cursor from previous response</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={`endpoint${openEndpoint === 'get-seller' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('get-seller')}>
                <span className="endpoint-method get">GET</span>
                <span className="endpoint-path">/v1/sellers/:id</span>
                <span className="endpoint-desc">Get seller detail</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Returns full detail for a single seller, including property data, ownership history, mortgage info, and outreach status.</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="doc-divider" />

          {/* Campaigns */}
          <section className="doc-section" id="campaigns" ref={setSectionRef}>
            <h2>Campaigns</h2>
            <p>Manage automated outreach campaigns programmatically.</p>

            <div className={`endpoint${openEndpoint === 'get-campaigns' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('get-campaigns')}>
                <span className="endpoint-method get">GET</span>
                <span className="endpoint-path">/v1/campaigns</span>
                <span className="endpoint-desc">List campaigns</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Returns all campaigns for your brokerage, including status, send counts, and response metrics.</p>
                </div>
              </div>
            </div>

            <div className={`endpoint${openEndpoint === 'post-campaigns' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('post-campaigns')}>
                <span className="endpoint-method post">POST</span>
                <span className="endpoint-path">/v1/campaigns</span>
                <span className="endpoint-desc">Create campaign</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Create a new outreach campaign. Specify target sellers by score range, geography, or trigger type.</p>
                  <table className="param-table">
                    <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                      <tr><td><span className="param-name">name</span><span className="param-req">required</span></td><td><span className="param-type">string</span></td><td className="param-desc">Campaign display name</td></tr>
                      <tr><td><span className="param-name">channels</span><span className="param-req">required</span></td><td><span className="param-type">string[]</span></td><td className="param-desc">Array of: <code>sms</code>, <code>email</code>, <code>mail</code>, <code>retargeting</code></td></tr>
                      <tr><td><span className="param-name">seller_filter</span><span className="param-req">required</span></td><td><span className="param-type">object</span></td><td className="param-desc">Filter object (same params as /v1/sellers)</td></tr>
                      <tr><td><span className="param-name">agent_id</span></td><td><span className="param-type">string</span></td><td className="param-desc">Assign to a specific agent</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={`endpoint${openEndpoint === 'put-campaign' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('put-campaign')}>
                <span className="endpoint-method put">PUT</span>
                <span className="endpoint-path">/v1/campaigns/:id</span>
                <span className="endpoint-desc">Update campaign</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Update campaign settings or pause/resume a running campaign.</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="doc-divider" />

          {/* Content */}
          <section className="doc-section" id="content" ref={setSectionRef}>
            <h2>Content</h2>
            <p>Access and manage auto-generated market reports and seller guides.</p>

            <div className={`endpoint${openEndpoint === 'get-content' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('get-content')}>
                <span className="endpoint-method get">GET</span>
                <span className="endpoint-path">/v1/content</span>
                <span className="endpoint-desc">List content pieces</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Returns generated content pieces filtered by type, zip code, or status.</p>
                </div>
              </div>
            </div>

            <div className={`endpoint${openEndpoint === 'post-content' ? ' open' : ''}`}>
              <div className="endpoint-header" onClick={() => toggleEndpoint('post-content')}>
                <span className="endpoint-method post">POST</span>
                <span className="endpoint-path">/v1/content/generate</span>
                <span className="endpoint-desc">Generate content</span>
              </div>
              <div className="endpoint-body">
                <div className="endpoint-body-inner">
                  <p>Trigger generation of a new market report or seller guide for a specific zip code.</p>
                  <table className="param-table">
                    <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                      <tr><td><span className="param-name">type</span><span className="param-req">required</span></td><td><span className="param-type">string</span></td><td className="param-desc"><code>market_report</code>, <code>seller_guide</code>, or <code>neighborhood_analysis</code></td></tr>
                      <tr><td><span className="param-name">zip_code</span><span className="param-req">required</span></td><td><span className="param-type">string</span></td><td className="param-desc">Target zip code</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <hr className="doc-divider" />

          {/* Webhooks */}
          <section className="doc-section" id="webhooks" ref={setSectionRef}>
            <h2>Webhooks</h2>
            <p>Receive real-time notifications when events occur in Signal. Configure webhook endpoints in your dashboard under <strong>Settings &rarr; Webhooks</strong>.</p>

            <h3>Available events</h3>
            <table className="param-table">
              <thead><tr><th>Event</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><span className="param-name">seller.score_changed</span></td><td className="param-desc">A seller's score crossed a threshold you've configured</td></tr>
                <tr><td><span className="param-name">seller.new_signal</span></td><td className="param-desc">A new trigger event detected for a tracked property</td></tr>
                <tr><td><span className="param-name">campaign.response</span></td><td className="param-desc">A seller responded to an outreach campaign</td></tr>
                <tr><td><span className="param-name">campaign.completed</span></td><td className="param-desc">A campaign finished its sequence</td></tr>
                <tr><td><span className="param-name">content.published</span></td><td className="param-desc">A generated content piece is ready</td></tr>
              </tbody>
            </table>

            <h3>Payload format</h3>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span><button className="code-copy" onClick={handleCopy}>Copy</button></div>
              <div className="code-body">{'{\n  '}<span className="cm-key">"event"</span>{': '}<span className="cm-str">"seller.new_signal"</span>{',\n  '}<span className="cm-key">"timestamp"</span>{': '}<span className="cm-str">"2026-04-28T14:32:00Z"</span>{',\n  '}<span className="cm-key">"data"</span>{': {\n    '}<span className="cm-key">"seller_id"</span>{': '}<span className="cm-str">"sel_1a2b3c"</span>{',\n    '}<span className="cm-key">"trigger"</span>{': '}<span className="cm-str">"Pre-foreclosure"</span>{',\n    '}<span className="cm-key">"score"</span>{': '}<span className="cm-num">91</span>{',\n    '}<span className="cm-key">"previous_score"</span>{': '}<span className="cm-num">74</span>{'\n  }\n}'}</div>
            </div>
            <p>Signal retries failed webhook deliveries up to 5 times with exponential backoff. Verify payloads using the <code>X-Signal-Signature</code> header (HMAC-SHA256 of the body using your webhook secret).</p>
          </section>

          <hr className="doc-divider" />

          {/* CRM Integration */}
          <section className="doc-section" id="crm-integration" ref={setSectionRef}>
            <h2>CRM integration</h2>
            <p>Signal integrates natively with major real estate CRMs. Seller data, scores, and campaign activity sync automatically.</p>

            <h3>Supported CRMs</h3>
            <ul>
              <li><strong>Follow Up Boss</strong> — Bi-directional sync of contacts, notes, and deal stages</li>
              <li><strong>KvCORE</strong> — Lead import and score overlay on existing contacts</li>
              <li><strong>BoomTown</strong> — Pipeline sync and automated task creation</li>
              <li><strong>Chime</strong> — Contact enrichment and campaign triggers</li>
              <li><strong>Salesforce</strong> — Custom object mapping with managed package</li>
            </ul>
            <p>To connect, go to <strong>Settings &rarr; Integrations</strong>, select your CRM, and follow the OAuth flow. Data begins syncing within 60 seconds.</p>

            <h3>Zapier</h3>
            <p>For CRMs without a native integration, use our Zapier app. It exposes all webhook events as triggers and all API endpoints as actions.</p>
          </section>

          <hr className="doc-divider" />

          {/* Data Model */}
          <section className="doc-section" id="data-model" ref={setSectionRef}>
            <h2>Data model</h2>
            <p>Signal's core entities and how they relate:</p>

            <div className="code-block">
              <div className="code-header"><span className="code-lang">text</span><button className="code-copy" onClick={handleCopy}>Copy</button></div>
              <div className="code-body"><span className="cm-comment">Brokerage</span>{'\n  \u2514\u2500 '}<span className="cm-key">Agents[]</span>{'\n  \u2514\u2500 '}<span className="cm-key">Sellers[]</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">score</span>{'          '}<span className="cm-comment"># 0-100 likelihood to sell</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">triggers[]</span>{'     '}<span className="cm-comment"># life events, financial signals</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">property</span>{'       '}<span className="cm-comment"># beds, baths, sqft, lot, year</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">ownership</span>{'      '}<span className="cm-comment"># purchase date, mortgage, equity</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">outreach_status</span>{' '}<span className="cm-comment"># none | active | responded</span>{'\n  \u2514\u2500 '}<span className="cm-key">Campaigns[]</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">channels[]</span>{'     '}<span className="cm-comment"># sms, email, mail, retargeting</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">seller_filter</span>{'  '}<span className="cm-comment"># targeting criteria</span>{'\n  \u2502    \u2514\u2500 '}<span className="cm-str">metrics</span>{'        '}<span className="cm-comment"># sent, responses, rate</span>{'\n  \u2514\u2500 '}<span className="cm-key">Content[]</span>{'\n       \u2514\u2500 '}<span className="cm-str">type</span>{'           '}<span className="cm-comment"># market_report, seller_guide, etc.</span>{'\n       \u2514\u2500 '}<span className="cm-str">zip_code</span>{'       '}<span className="cm-comment"># target geography</span></div>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </>
  );
}
