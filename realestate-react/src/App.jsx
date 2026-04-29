import { useEffect, useRef, useCallback } from 'react';
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

  const handleAddToPipeline = useCallback(() => {
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

  return (
    <>
      <Nav />
      <Hero />
      <ScrollMap sellers={sellers} onAddToPipeline={handleAddToPipeline} />
      <Dashboard ref={dashboardRef} />
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
