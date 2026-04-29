import { Link } from 'react-router-dom';

export default function Cta() {
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <h2>See your market<br />before everyone else</h2>
        <p>Signal is currently available for brokerages with 10+ agents in select California markets.</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn-primary-lg">Start free trial</Link>
          <button className="btn-secondary-lg">Book a demo</button>
        </div>
      </div>
    </section>
  );
}
