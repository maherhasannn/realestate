import { getTriggerWeight } from './triggerWeights';

/**
 * Component weights for the composite likelihood score.
 * Must sum to 1.0.
 */
const WEIGHTS = {
  baseScore:    0.30,
  recency:      0.25,
  equity:       0.20,
  triggerType:  0.25,
};

/**
 * Exponential decay for recency.
 * 0 days ago = 100, 90+ days ≈ 10.
 */
function recencySignal(days) {
  if (days == null || days < 0) return 50;
  // decay constant chosen so that 90 days ≈ 10
  const k = 0.025;
  return Math.max(10, Math.round(100 * Math.exp(-k * days)));
}

/**
 * Parse a dollar string like "$1.8M", "$890K", or "$0" into a number.
 */
function parseDollar(str) {
  if (!str || str === '$0') return 0;
  const cleaned = str.replace(/[^0-9.MKmk]/g, '');
  let num = parseFloat(cleaned) || 0;
  if (/[Mm]/.test(str)) num *= 1_000_000;
  else if (/[Kk]/.test(str)) num *= 1_000;
  return num;
}

/**
 * Equity signal: how much equity the seller has.
 * High equity = more motivation flexibility, mapped to 20–100.
 */
function equitySignal(est, mortgageBalance) {
  const estVal = typeof est === 'number' ? est : parseDollar(String(est));
  const mortVal = parseDollar(String(mortgageBalance || '$0'));
  if (estVal <= 0) return 50; // unknown
  const ratio = Math.max(0, (estVal - mortVal) / estVal);
  // Map ratio 0..1 → 20..100
  return Math.round(20 + ratio * 80);
}

/**
 * Compute a single seller's likelihood-to-sell score.
 *
 * @param {object} seller - Seller object with score, days, est, mortgageBalance, trigger
 * @param {object} [externalFactors={}] - Optional external data (future hook point)
 * @returns {{ likelihood: number, tier: string, components: object }}
 */
export function computeLikelihood(seller, externalFactors = {}) {
  const base = Math.min(100, Math.max(0, seller.score || 0));
  const rec = recencySignal(seller.days);
  const eq = equitySignal(seller.est, seller.mortgageBalance);
  const tw = Math.round(getTriggerWeight(seller.trigger) * 100);

  // Optional external adjustment (placeholder for data source integration)
  const extAdj = externalFactors.adjustment || 0;

  const raw =
    WEIGHTS.baseScore   * base +
    WEIGHTS.recency     * rec +
    WEIGHTS.equity      * eq +
    WEIGHTS.triggerType * tw +
    extAdj;

  const likelihood = Math.min(100, Math.max(0, Math.round(raw)));

  let tier = 'low';
  if (likelihood >= 75) tier = 'high';
  else if (likelihood >= 50) tier = 'mid';

  return {
    likelihood,
    tier,
    components: {
      baseScore: base,
      recency: rec,
      equity: eq,
      triggerWeight: tw,
    },
  };
}

/**
 * Batch-compute likelihood for an array of sellers.
 * @param {object[]} sellers
 * @param {object} [externalFactors={}]
 * @returns {Map<number, { likelihood, tier, components }>}
 */
export function computeBatchLikelihood(sellers, externalFactors = {}) {
  const results = new Map();
  for (const seller of sellers) {
    results.set(seller.id, computeLikelihood(seller, externalFactors));
  }
  return results;
}
