import { useState, useEffect } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="index.html" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="nav-logo-dot"></div>
        <span className="nav-logo-text">Signal</span>
      </a>
      <div className="nav-links">
        <a href="product.html" className="nav-link nav-link-desktop">Product</a>
        <a href="pricing.html" className="nav-link nav-link-desktop">Pricing</a>
        <a href="docs.html" className="nav-link nav-link-desktop">Docs</a>
        <a href="login.html" className="nav-link">Log in</a>
        <button className="btn-primary" onClick={() => { location.href = 'login.html'; }}>Start free trial</button>
      </div>
    </nav>
  );
}
