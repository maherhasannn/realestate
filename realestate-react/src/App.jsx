import { useEffect, useRef, useCallback } from 'react';
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

const FEATURED_ID = 7;

export default function App() {
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
      if (!window.__mapScrollLocked) document.documentElement.style.overflow = '';
    }

    function onPageShow(e) {
      if (!window.__mapScrollLocked) document.documentElement.style.overflow = '';
      if (e.persisted) location.reload();
    }

    function onVisibilityChange() {
      if (!document.hidden && !window.__mapScrollLocked) {
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
