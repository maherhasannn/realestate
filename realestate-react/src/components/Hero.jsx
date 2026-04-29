export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <div className="hero-badge-dot"></div>
        Now in private beta
      </div>

      <h1>See tomorrow's listings<br />before the market does</h1>

      <p className="hero-sub">
        A next-generation AI platform that predicts likely sellers, launches automated outreach, and gives brokerages a live pipeline view of future inventory.
      </p>

      <div className="hero-ctas">
        <button className="btn-primary-lg">Start free trial</button>
        <button className="btn-secondary-lg">See how it works</button>
      </div>
    </section>
  );
}
