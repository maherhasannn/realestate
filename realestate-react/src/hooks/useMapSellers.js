import { useMemo } from 'react';
import { useSellers } from './useSellers';
import { computeBatchLikelihood } from '../lib/neural';

/**
 * Hook that combines useSellers() with neural engine batch scoring.
 * Filters to sellers that have lat/lng in the database and attaches
 * likelihood, tier, and component breakdown to each seller.
 *
 * @returns {{ data: object[], loading: boolean, error: string|null, refetch: Function }}
 */
export function useMapSellers() {
  const { data: sellers, loading, error, refetch } = useSellers();

  const data = useMemo(() => {
    if (!sellers || sellers.length === 0) return [];

    const withCoords = sellers.filter(s => s.lat != null && s.lng != null);
    const scores = computeBatchLikelihood(withCoords);

    return withCoords.map(seller => {
      const score = scores.get(seller.id);
      return {
        ...seller,
        likelihood: score?.likelihood ?? 0,
        tier: score?.tier ?? 'low',
        components: score?.components ?? {},
      };
    });
  }, [sellers]);

  return { data, loading, error, refetch };
}
