import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Nav({ activePage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}>
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

      <button
        className={`hamburger${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {menuOpen && <div className="mobile-menu-overlay" onClick={closeMenu} />}

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/product" className={`mobile-menu-link${activePage === 'product' ? ' active' : ''}`} onClick={closeMenu}>Product</Link>
        <Link to="/pricing" className={`mobile-menu-link${activePage === 'pricing' ? ' active' : ''}`} onClick={closeMenu}>Pricing</Link>
        <Link to="/docs" className={`mobile-menu-link${activePage === 'docs' ? ' active' : ''}`} onClick={closeMenu}>Docs</Link>
        <Link to="/login" className="mobile-menu-link" onClick={closeMenu}>Log in</Link>
        <button className="btn-primary mobile-menu-cta" onClick={() => { closeMenu(); navigate('/login'); }}>Start free trial</button>
      </div>
    </nav>
  );
}
