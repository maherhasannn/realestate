# Data Sources & Neural Engine — Integration Status

## Architecture Overview

```
Supabase sellers → useMapSellers hook → computeBatchLikelihood()
                                              ↑
                                     externalFactors (not yet wired)
                                              ↑
                                     fetchExternalFactors() ← adapters (all disabled)
```

**Scoring engine:** `src/lib/neural/computeScore.js`
**Adapter registry:** `src/lib/dataSources/index.js`
**Map hook:** `src/hooks/useMapSellers.js`

---

## Scoring Engine — Current Formula

`computeLikelihood(seller, externalFactors)` returns `{ likelihood: 0-100, tier, components }`

| Component | Weight | Source | Notes |
|-----------|--------|--------|-------|
| baseScore | 0.30 | `seller.score` | Straight from DB |
| recency | 0.25 | `seller.days` | Exponential decay, 0d=100, 90d≈10 |
| equity | 0.20 | `seller.est` - `seller.mortgageBalance` | Parses "$1.8M" strings |
| triggerType | 0.25 | `seller.trigger` → `TRIGGER_WEIGHTS` map | 14 triggers defined |

**Gap:** The only external hook is `externalFactors.adjustment` — a single number added to the raw score. The adapters return structured fields (rates, indices, counts) but nothing translates those into an adjustment value yet.

---

## Adapter Status (all 9 disabled)

### Ready to wire (free public APIs)

| Adapter | File | API Endpoint | Key | Fields Returned |
|---------|------|-------------|-----|-----------------|
| FRED | `fredAdapter.js` | `api.stlouisfed.org/fred/series/observations` | Free signup at fred.stlouisfed.org | `mortgageRate30yr`, `unemploymentRate`, `cpiIndex` |
| Census ACS | `censusAdapter.js` | `api.census.gov/data/{year}/acs/acs5` | Optional (500 req/day without) | `medianIncome`, `netMigration`, `vacancyRate`, `population` |
| BLS | `blsAdapter.js` | `api.bls.gov/publicAPI/v2/timeseries/data/` | Optional (25 req/day v1, 500/day v2) | `localUnemployment`, `employmentGrowth`, `avgWeeklyEarnings` |

### Harder to wire

| Adapter | File | Blocker |
|---------|------|---------|
| Redfin | `redfinAdapter.js` | No API — CSV downloads from data center, need to parse/host |
| FHFA | `fhfaAdapter.js` | Static Excel/CSV files, no REST API |
| HMDA/CFPB | `hmdaAdapter.js` | Bulk download only, not per-property lookup |
| County Assessor | `countyAssessorAdapter.js` | Different API per county, no universal endpoint |
| City Permits | `permitAdapter.js` | Different per city, some use Socrata open data |
| CourtListener | `courtAdapter.js` | Has REST API (5000 req/day free) but queries by name/case, not property address |

---

## To Wire an Adapter

Each adapter follows this interface in `src/lib/dataSources/`:

```js
export const exampleAdapter = {
  name: 'example',
  description: '...',
  isAvailable() { return false; },          // flip to true when ready
  async fetch(params) { return { ... }; },  // implement real fetch
};
```

### Steps

1. **Implement `fetch()`** — call the real API, return the documented fields
2. **Flip `isAvailable()`** — return `true` (or check for env var / API key)
3. **Add score mapping** — in `computeScore.js`, translate the adapter's fields into a numeric `adjustment` value that shifts the likelihood score. This is the missing piece. Example approach:
   ```js
   // In computeScore.js or a new mapExternalFactors.js
   function computeAdjustment(externalFactors) {
     let adj = 0;
     if (externalFactors.mortgageRate30yr > 7.0) adj += 3;  // high rates = more distress
     if (externalFactors.vacancyRate > 0.10) adj += 2;       // high vacancy = more supply
     if (externalFactors.localUnemployment > 6.0) adj += 2;  // economic stress
     return adj;
   }
   ```
4. **Add caching** — adapters return macro data (rates, indices) that doesn't change per-seller. Cache results in memory or localStorage with TTL matching the data's refresh cadence (see each adapter's JSDoc for guidance).
5. **Pass to scoring** — `useMapSellers.js` should call `fetchExternalFactors()` and pass the result to `computeBatchLikelihood(sellers, externalFactors)`.

---

## Env Vars Needed

```
VITE_FRED_API_KEY=           # from https://fred.stlouisfed.org/docs/api/api_key.html
VITE_CENSUS_API_KEY=         # from https://api.census.gov/data/key_signup.html (optional)
VITE_BLS_API_KEY=            # from https://data.bls.gov/registrationEngine/ (optional for v1)
```

---

## Map Page Notes

- Route: `/app/map` — `src/pages/app/MapPage.jsx`
- Uses `useMapSellers()` hook which filters to sellers with `lat`/`lng` in Supabase
- Sellers without coordinates are excluded from the map (no fallback to fake data)
- Mapbox token: `VITE_MAPBOX_TOKEN` in `.env`
- Heatmap intensity is driven by `likelihood` property from the neural engine
- Pin colors: green (75+), gray-500 (50-74), gray-300 (<50)
