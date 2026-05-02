import { useMemo } from 'react';
import { useSellers } from './useSellers';
import { computeBatchLikelihood } from '../lib/neural';
import { sellerCoords } from '../data/sellers';

/**
 * Hook that combines useSellers() with neural engine batch scoring.
 * Filters to sellers with lat/lng coordinates and attaches
 * likelihood, tier, and component breakdown to each seller.
 *
 * @returns {{ data: object[], loading: boolean, error: string|null, refetch: Function }}
 */
export function useMapSellers() {
  const { data: sellers, loading, error, refetch } = useSellers();

  const data = useMemo(() => {
    if (!sellers || sellers.length === 0) return [];

    const scores = computeBatchLikelihood(sellers);

    return sellers
      .map(seller => {
        const coords = sellerCoords[seller.id];
        if (!coords) return null;

        const score = scores.get(seller.id);
        return {
          ...seller,
          lat: coords[1],
          lng: coords[0],
          likelihood: score?.likelihood ?? 0,
          tier: score?.tier ?? 'low',
          components: score?.components ?? {},
        };
      })
      .filter(Boolean);
  }, [sellers]);

  return { data, loading, error, refetch };
}
