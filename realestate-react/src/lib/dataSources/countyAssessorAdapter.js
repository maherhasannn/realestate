/**
 * County Assessor Adapter
 *
 * Source: Varies by county (e.g., LA County Assessor https://assessor.lacounty.gov/)
 * Endpoint: County-specific APIs or bulk download portals
 * Fields: assessed_value, tax_delinquent, last_assessment_date, exemptions
 * Rate limits: Varies by county portal
 * Caching: Annual refresh recommended (assessments update yearly)
 *
 * Status: DISABLED — placeholder for future integration
 */
export const countyAssessorAdapter = {
  name: 'countyAssessor',
  description: 'County assessor — property valuations, tax delinquency',

  isAvailable() {
    return false;
  },

  async fetch(/* { apn, county } */) {
    return {
      assessedValue: null,
      taxDelinquent: null,
      lastAssessmentDate: null,
      exemptions: null,
    };
  },
};
