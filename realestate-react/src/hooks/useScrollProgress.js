import { useState, useEffect, useCallback } from 'react';

export default function useScrollProgress(runwayRef) {
  const [progress, setProgress] = useState(0);

  const getProgress = useCallback(() => {
    if (!runwayRef.current) return 0;
    const rect = runwayRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollable = rect.height - viewH;
    if (scrollable <= 0) return 0;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / scrollable));
  }, [runwayRef]);

  useEffect(() => {
    let rafId = null;
    let lastVal = -1;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const p = getProgress();
        if (Math.abs(p - lastVal) > 0.001) {
          lastVal = p;
          setProgress(p);
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [getProgress]);

  return progress;
}
