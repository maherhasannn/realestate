import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const FAQ_ITEMS = [
  { q: "What's included in the free trial?", a: "Every trial gets full Pro-tier access for 14 days, including multi-channel outreach, predictive scores, and the brokerage dashboard. No credit card required." },
  { q: "Is there a minimum number of agents?", a: "Yes. Starter and Pro plans require a minimum of 10 agents. Enterprise pricing is custom and starts at 50 agents." },
  { q: "What markets do you cover?", a: "Signal currently covers all major metro areas in California. We're expanding to Arizona, Nevada, Texas, and Florida in Q3 2026." },
  { q: "Can I cancel anytime?", a: "Monthly plans can be cancelled anytime. Annual plans are billed upfront and can be cancelled at renewal. No termination fees." },
  { q: "How does outreach compliance work?", a: "Signal handles DNC list scrubbing, TCPA compliance for SMS, CAN-SPAM compliance for email, and USPS compliance for direct mail automatically. You stay compliant without thinking about it." },
  { q: "Do you integrate with my CRM?", a: "We have native integrations with Follow Up Boss, KvCORE, BoomTown, Chime, and Salesforce. Enterprise plans include custom CRM integrations and full REST API access." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Nav activePage="pricing" />

      {/* Hero */}
      <section className="pricing-hero">
        <div className="hero-tag">Pricing</div>
        <h1>Simple pricing,<br/>no surprises</h1>
        <p className="hero-sub">Per-agent pricing that scales with your brokerage. Every plan includes full platform access.</p>

        <div className="billing-toggle">
          <span className={!annual ? 'active' : ''}>Monthly</span>
          <button
            className={`toggle-switch${annual ? ' on' : ''}`}
            aria-label="Toggle billing period"
            onClick={() => setAnnual(!annual)}
          >
            <div className="toggle-knob"></div>
          </button>
          <span className={annual ? 'active' : ''}>Annual</span>
          <span className="save-badge">Save 20%</span>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pricing-section">
        <div className="pricing-grid">
          {/* Starter */}
          <div className="pricing-card">
            <div className="pc-badge"></div>
            <div className="pc-name">Starter</div>
            <div className="pc-desc">For small teams getting started with predictive prospecting.</div>
            <div className="pc-price">
              <span className="pc-price-num">${annual ? '69' : '89'}</span>
              <span className="pc-price-period">/ agent / mo</span>
            </div>
            <div className="pc-price-note">10 agent minimum</div>
            <Link to="/login" className="pc-btn pc-btn-outline">Start free trial</Link>
            <hr className="pc-divider" />
            <ul className="pc-features">
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Predictive seller scores</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Up to 500 tracked sellers</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Email outreach sequences</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Basic pipeline dashboard</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Monthly market reports</li>
              <li className="pc-feature"><span className="pc-x">&#10005;</span> SMS &amp; direct mail</li>
              <li className="pc-feature"><span className="pc-x">&#10005;</span> Retargeting ads</li>
              <li className="pc-feature"><span className="pc-x">&#10005;</span> API access</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="pricing-card featured">
            <div className="pc-badge"><span className="pc-badge-text">Most popular</span></div>
            <div className="pc-name">Pro</div>
            <div className="pc-desc">Full platform for growth-focused brokerages.</div>
            <div className="pc-price">
              <span className="pc-price-num">${annual ? '139' : '179'}</span>
              <span className="pc-price-period">/ agent / mo</span>
            </div>
            <div className="pc-price-note">10 agent minimum</div>
            <Link to="/login" className="pc-btn pc-btn-white">Start free trial</Link>
            <hr className="pc-divider" />
            <ul className="pc-features">
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Predictive seller scores</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Unlimited tracked sellers</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Multi-channel outreach (SMS, email, mail)</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Retargeting ad campaigns</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Full brokerage dashboard</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Hyperlocal content generation</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> A/B testing</li>
              <li className="pc-feature"><span className="pc-x">&#10005;</span> API access</li>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="pricing-card">
            <div className="pc-badge"></div>
            <div className="pc-name">Enterprise</div>
            <div className="pc-desc">Custom deployment for large brokerages and franchises.</div>
            <div className="pc-price">
              <span className="pc-price-num">Custom</span>
            </div>
            <div className="pc-price-note">Volume discounts available</div>
            <button className="pc-btn pc-btn-outline">Contact sales</button>
            <hr className="pc-divider" />
            <ul className="pc-features">
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Everything in Pro</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> REST API &amp; webhooks</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Custom CRM integrations</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> SSO / SAML</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Dedicated account manager</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> Custom data feeds</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> SLA &amp; priority support</li>
              <li className="pc-feature"><span className="pc-check">&#10003;</span> On-premise option</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-title">Frequently asked questions</div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
            <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
              <span>{item.q}</span>
              <span className="faq-arrow">+</span>
            </div>
            <div className="faq-a"><p>{item.a}</p></div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Start your 14-day free trial</h2>
          <p>Full Pro access. No credit card required. Set up in under 5 minutes.</p>
          <Link to="/login" className="pc-btn pc-btn-dark" style={{display:'inline-block', width:'auto', padding:'14px 32px', fontSize:'15px'}}>Get started</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
