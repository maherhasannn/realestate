/**
 * Trigger reason weight registry.
 * Maps seller trigger strings to a 0.0–1.0 likelihood multiplier.
 * Higher weight = stronger sell signal.
 */
export const TRIGGER_WEIGHTS = {
  'Pre-foreclosure':            0.95,
  'Second mortgage default':    0.93,
  'Divorce filing':             0.92,
  'Property tax delinquency':   0.90,
  'Insurance non-renewal':      0.88,
  'Insurance claim filed':      0.85,
  'Probate filed':              0.87,
  'Estate planning transfer':   0.80,
  'Permit for repairs denied':  0.78,
  'Listed FSBO then cancelled': 0.91,
  'Job relocation filing':      0.86,
  'Equity withdrawal':          0.75,
  'Absentee owner + age':       0.72,
  'Absentee owner + vacancy':   0.70,
};

const DEFAULT_WEIGHT = 0.50;

/**
 * Get the weight for a given trigger reason string.
 * Returns DEFAULT_WEIGHT (0.50) for unknown triggers.
 */
export function getTriggerWeight(reason) {
  if (!reason) return DEFAULT_WEIGHT;
  return TRIGGER_WEIGHTS[reason] ?? DEFAULT_WEIGHT;
}
