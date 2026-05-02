/**
 * HMDA/CFPB Adapter (Home Mortgage Disclosure Act)
 *
 * Source: https://ffiec.cfpb.gov/data-publication/
 * Endpoint: https://ffiec.cfpb.gov/v2/data-browser-api/view/csv
 * Fields: origination_count, denial_rate, avg_loan_amount, avg_interest_rate
 * Rate limits: No formal limits; large dataset downloads
 * Caching: Annual refresh (HMDA data published yearly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const hmdaAdapter = {
  name: 'hmda',
  description: 'HMDA/CFPB — mortgage origination and denial data',

  isAvailable() {
    return false;
  },

  async fetch(/* { county, year } */) {
    return {
      originationCount: null,
      denialRate: null,
      avgLoanAmount: null,
      avgInterestRate: null,
    };
  },
};
