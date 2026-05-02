/**
 * FRED API Adapter (Federal Reserve Economic Data)
 *
 * Source: https://fred.stlouisfed.org/
 * Endpoint: https://api.stlouisfed.org/fred/series/observations
 * Fields: mortgage_rate (MORTGAGE30US), unemployment (UNRATE), cpi (CPIAUCSL)
 * Rate limits: 120 requests/minute with API key
 * Caching: Daily refresh recommended (most series update monthly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const fredAdapter = {
  name: 'fred',
  description: 'FRED API — mortgage rates, unemployment, CPI',

  isAvailable() {
    return false;
  },

  async fetch(/* { seriesIds } */) {
    return {
      mortgageRate30yr: null,
      unemploymentRate: null,
      cpiIndex: null,
    };
  },
};
