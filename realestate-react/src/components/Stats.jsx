import { useEffect, useRef, useCallback } from 'react';

const stats = [
  { target: 1284, decimals: 0, prefix: '', suffix: '', label: 'High-probability sellers' },
  { target: 312, decimals: 0, prefix: '', suffix: '', label: 'Projected listings (90 days)' },
  { target: 428, decimals: 0, prefix: '', suffix: '', label: 'Active agent campaigns' },
  { target: 14.2, decimals: 1, prefix: '$', suffix: 'M', label: 'Projected commission' },
];

export default function Stats() {
  const refs = useRef([]);

  const animateCounter = useCallback((el, stat) => {
    const duration = 2000;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = eased * stat.target;
      el.textContent = stat.decimals > 0
        ? stat.prefix + current.toFixed(stat.decimals) + stat.suffix
        : stat.prefix + Math.round(current).toLocaleString() + stat.suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.idx, 10);
          animateCounter(entry.target, stats[idx]);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    refs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [animateCounter]);

  return (
    <section className="stats-section">
      <div className="stats-bar">
        {stats.map((s, i) => (
          <div className="stat-item" key={i}>
            <div
              className="stat-value"
              ref={el => { refs.current[i] = el; }}
              data-idx={i}
            >
              0
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="stats-caption">Southern California &middot; Live data</p>
    </section>
  );
}
