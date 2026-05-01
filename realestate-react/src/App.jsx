import { useEffect, useRef, useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { sellers } from './data/sellers';
import Nav from './components/Nav';
import Hero from './components/Hero';
import ScrollMap from './components/ScrollMap';
import Dashboard from './components/Dashboard/Dashboard';
import Stats from './components/Stats';
import Features from './components/Features';
import Quote from './components/Quote';
import Cta from './components/Cta';
import Footer from './components/Footer';
import ProductPage from './pages/ProductPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import DocsPage from './pages/DocsPage';

const FEATURED_ID = 7;

function HomePage() {
  const dashboardRef = useRef(null);
  const mapWrapRef = useRef(null);
  const dashboardWrapRef = useRef(null);
  const mapCollapsedRef = useRef(false);
  const [pipelineConfirmed, setPipelineConfirmed] = useState(false);

  const handleAddToPipeline = useCallback(() => {
    setPipelineConfirmed(true);
    if (dashboardRef.current) {
      dashboardRef.current.highlightSeller(FEATURED_ID);
    }
  }, []);

  useEffect(() => {
    // Force clean state on every page load
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = '';

    function onPageHide() {
      document.documentElement.style.overflow = '';
    }

    function onPageShow(e) {
      document.documentElement.style.overflow = '';
      if (e.persisted) location.reload();
    }

    function onVisibilityChange() {
      if (!document.hidden) {
        document.documentElement.style.overflow = '';
      }
    }

    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Collapse map (only) once the dashboard scrolls into view
  useEffect(() => {
    if (!pipelineConfirmed || mapCollapsedRef.current) return;
    const dashEl = dashboardWrapRef.current;
    const mapEl = mapWrapRef.current;
    if (!dashEl || !mapEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !mapCollapsedRef.current) {
          mapCollapsedRef.current = true;
          observer.disconnect();
          requestAnimationFrame(() => {
            const removedHeight = mapEl.offsetHeight;
            if (removedHeight === 0) return; // Already collapsed by auto-scroll
            mapEl.style.height = '0';
            mapEl.style.overflow = 'hidden';
            window.scrollBy(0, -removedHeight);
          });
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(dashEl);
    return () => observer.disconnect();
  }, [pipelineConfirmed]);

  return (
    <>
      <Nav />
      <Hero />
      <div ref={mapWrapRef}>
        <ScrollMap sellers={sellers} onAddToPipeline={handleAddToPipeline} />
      </div>
      <div ref={dashboardWrapRef}>
        <Dashboard ref={dashboardRef} />
      </div>
      <Stats />
      <Features />
      <Quote />
      <Cta />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/docs" element={<DocsPage />} />
    </Routes>
  );
}
