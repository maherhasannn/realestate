import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Nav({ activePage }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="nav-logo-dot"></div>
        <span className="nav-logo-text">Signal</span>
      </Link>
      <div className="nav-links">
        <Link to="/product" className={`nav-link nav-link-desktop${activePage === 'product' ? ' active' : ''}`}>Product</Link>
        <Link to="/pricing" className={`nav-link nav-link-desktop${activePage === 'pricing' ? ' active' : ''}`}>Pricing</Link>
        <Link to="/docs" className={`nav-link nav-link-desktop${activePage === 'docs' ? ' active' : ''}`}>Docs</Link>
        <Link to="/login" className="nav-link">Log in</Link>
        <button className="btn-primary" onClick={() => navigate('/login')}>Start free trial</button>
      </div>
    </nav>
  );
}
