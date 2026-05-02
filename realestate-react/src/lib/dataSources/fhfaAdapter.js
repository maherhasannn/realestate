/**
 * FHFA House Price Index Adapter
 *
 * Source: https://www.fhfa.gov/data/hpi
 * Endpoint: https://www.fhfa.gov/DataTools/Downloads/Documents/HPI/
 * Fields: hpi_index, qoq_change, yoy_change
 * Rate limits: Static file downloads, no API limits
 * Caching: Quarterly refresh (HPI updates quarterly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const fhfaAdapter = {
  name: 'fhfa',
  description: 'FHFA House Price Index — quarterly price trends',

  isAvailable() {
    return false;
  },

  async fetch(/* { msa, state } */) {
    return {
      hpiIndex: null,
      qoqChange: null,
      yoyChange: null,
    };
  },
};
