import { redfinAdapter } from './redfinAdapter';
import { fredAdapter } from './fredAdapter';
import { censusAdapter } from './censusAdapter';
import { hmdaAdapter } from './hmdaAdapter';
import { fhfaAdapter } from './fhfaAdapter';
import { countyAssessorAdapter } from './countyAssessorAdapter';
import { permitAdapter } from './permitAdapter';
import { courtAdapter } from './courtAdapter';
import { blsAdapter } from './blsAdapter';

/**
 * Registry of all external data source adapters.
 * Each adapter follows the interface:
 *   { name, description, isAvailable: () => boolean, fetch: async (params) => object }
 */
export const DATA_SOURCE_ADAPTERS = [
  redfinAdapter,
  fredAdapter,
  censusAdapter,
  hmdaAdapter,
  fhfaAdapter,
  countyAssessorAdapter,
  permitAdapter,
  courtAdapter,
  blsAdapter,
];

/**
 * Fetch and merge results from all available (enabled) adapters.
 * Returns a single object with all fields merged, suitable for
 * passing as `externalFactors` to the neural engine.
 *
 * @param {object} [params={}] - Query parameters forwarded to each adapter
 * @returns {Promise<object>} Merged external factors
 */
export async function fetchExternalFactors(params = {}) {
  const available = DATA_SOURCE_ADAPTERS.filter(a => a.isAvailable());
  if (available.length === 0) return {};

  const results = await Promise.allSettled(
    available.map(a => a.fetch(params))
  );

  let merged = {};
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      merged = { ...merged, ...result.value };
    }
  }
  return merged;
}
