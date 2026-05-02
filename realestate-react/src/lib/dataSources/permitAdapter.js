/**
 * City Permit Portal Adapter
 *
 * Source: Varies by city (e.g., LA Building & Safety https://ladbs.org/)
 * Endpoint: City-specific open data APIs (often Socrata-based)
 * Fields: permit_count, permit_types, renovation_activity, recent_denials
 * Rate limits: Varies; typically 1000 req/hour with app token
 * Caching: Weekly refresh recommended
 *
 * Status: DISABLED — placeholder for future integration
 */
export const permitAdapter = {
  name: 'permit',
  description: 'City permit portals — renovation and construction activity',

  isAvailable() {
    return false;
  },

  async fetch(/* { address, city } */) {
    return {
      permitCount: null,
      permitTypes: null,
      renovationActivity: null,
      recentDenials: null,
    };
  },
};
