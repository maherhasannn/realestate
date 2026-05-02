/**
 * Census ACS Adapter (American Community Survey)
 *
 * Source: https://data.census.gov/
 * Endpoint: https://api.census.gov/data/{year}/acs/acs5
 * Fields: median_income, net_migration, vacancy_rate, population
 * Rate limits: 500 requests/day without key, unlimited with key
 * Caching: Annual refresh (ACS data updates yearly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const censusAdapter = {
  name: 'census',
  description: 'Census ACS — income, migration, vacancy rates',

  isAvailable() {
    return false;
  },

  async fetch(/* { fips, tract } */) {
    return {
      medianIncome: null,
      netMigration: null,
      vacancyRate: null,
      population: null,
    };
  },
};
