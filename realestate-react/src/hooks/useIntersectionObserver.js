import { useEffect } from 'react';

export default function useIntersectionObserver(refs, callback, options = { threshold: 0.3 }) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    refs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [refs, callback, options]);
}
