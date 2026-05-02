/**
 * BLS API Adapter (Bureau of Labor Statistics)
 *
 * Source: https://www.bls.gov/developers/
 * Endpoint: https://api.bls.gov/publicAPI/v2/timeseries/data/
 * Fields: local_unemployment, employment_growth, avg_weekly_earnings
 * Rate limits: v2 with key: 500 req/day, 50 series/query
 * Caching: Monthly refresh (most series update monthly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const blsAdapter = {
  name: 'bls',
  description: 'BLS API — local employment and wage data',

  isAvailable() {
    return false;
  },

  async fetch(/* { areaCode, seriesId } */) {
    return {
      localUnemployment: null,
      employmentGrowth: null,
      avgWeeklyEarnings: null,
    };
  },
};
