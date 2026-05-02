/**
 * Redfin Data Center Adapter
 *
 * Source: https://www.redfin.com/news/data-center/
 * Endpoint: CSV downloads by metro/zip — weekly market metrics
 * Fields: median_sale_price, inventory, days_on_market, price_drops, new_listings
 * Rate limits: No formal API; scrape-friendly CSV files
 * Caching: Weekly refresh recommended (data updates weekly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const redfinAdapter = {
  name: 'redfin',
  description: 'Redfin Data Center — weekly market metrics by metro/zip',

  isAvailable() {
    return false;
  },

  async fetch(/* { zip, metro } */) {
    return {
      medianSalePrice: null,
      inventory: null,
      daysOnMarket: null,
      priceDropPct: null,
      newListings: null,
    };
  },
};
