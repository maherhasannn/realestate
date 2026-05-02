/**
 * CourtListener Adapter (Bankruptcy Filings)
 *
 * Source: https://www.courtlistener.com/
 * Endpoint: https://www.courtlistener.com/api/rest/v3/
 * Fields: bankruptcy_filed, filing_date, chapter, case_status
 * Rate limits: 5000 requests/day with free API key
 * Caching: Weekly refresh recommended
 *
 * Status: DISABLED — placeholder for future integration
 */
export const courtAdapter = {
  name: 'court',
  description: 'CourtListener — bankruptcy and civil filings',

  isAvailable() {
    return false;
  },

  async fetch(/* { name, state } */) {
    return {
      bankruptcyFiled: null,
      filingDate: null,
      chapter: null,
      caseStatus: null,
    };
  },
};
