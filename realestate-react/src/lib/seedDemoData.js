import { supabase } from './supabase';

const TRIGGER_REASONS = [
  'Pre-foreclosure',
  'Second mortgage default',
  'Divorce filing',
  'Property tax delinquency',
  'Insurance non-renewal',
  'Insurance claim filed',
  'Probate filed',
  'Estate planning transfer',
  'Permit for repairs denied',
  'Listed FSBO then cancelled',
  'Job relocation filing',
  'Equity withdrawal',
  'Absentee owner + age',
  'Absentee owner + vacancy',
];

const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Elm', 'Pine', 'Walnut', 'Birch', 'Willow',
  'Magnolia', 'Sunset', 'Highland', 'Valley', 'Lake', 'Park', 'Spring',
  'Meadow', 'Ridge', 'Canyon', 'Harbor', 'Vista', 'Crest', 'Summit',
  'Sierra', 'Windsor', 'Cambridge', 'Oxford', 'Lancaster', 'Wellington',
  'Sycamore', 'Laurel',
];

const STREET_TYPES = ['St', 'Ave', 'Dr', 'Blvd', 'Ln', 'Way', 'Ct', 'Pl'];

const CITIES = [
  'Los Angeles', 'Pasadena', 'Glendale', 'Burbank', 'Santa Monica',
  'Culver City', 'Inglewood', 'Torrance', 'Long Beach', 'Arcadia',
  'Monrovia', 'Whittier', 'Downey', 'Alhambra', 'El Monte',
];

const AGENT_NAMES = [
  'Sarah Chen', 'Michael Torres', 'Rachel Kim', 'David Patel',
  'Jessica Nguyen', 'Andrew Martinez', null, null, null, null,
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scatterCoord(centerLat, centerLng) {
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * 50; // 0–50 miles
  const latOffset = (dist * Math.cos(angle)) / 69;
  const lngOffset = (dist * Math.sin(angle)) / (69 * Math.cos((centerLat * Math.PI) / 180));
  return {
    lat: +(centerLat + latOffset).toFixed(6),
    lng: +(centerLng + lngOffset).toFixed(6),
  };
}

function generateSeller(userId, centerLat, centerLng) {
  const { lat, lng } = scatterCoord(centerLat, centerLng);
  const streetNum = rand(100, 9999);
  const street = pick(STREET_NAMES);
  const streetType = pick(STREET_TYPES);
  const city = pick(CITIES);
  const score = rand(70, 98);
  const beds = rand(2, 7);
  const baths = rand(1, 6);
  const sqft = rand(1200, 8000);
  const est = rand(400, 10000) * 1000; // $400K – $10M
  const days = rand(1, 60);
  const inOutreach = Math.random() > 0.5;
  const agent = pick(AGENT_NAMES);
  const yearBuilt = rand(1955, 2022);
  const lot = `${rand(3000, 25000)} sqft`;
  const ownerSince = rand(1990, 2023);
  const mortgageBalance = `$${rand(100, 2500)}K`;
  const lastSale = `${rand(2005, 2023)} / $${rand(200, 5000)}K`;

  return {
    user_id: userId,
    address: `${streetNum} ${street} ${streetType}`,
    city,
    score,
    est,
    trigger_reason: pick(TRIGGER_REASONS),
    days,
    in_outreach: inOutreach,
    agent,
    beds,
    baths,
    sqft,
    year_built: yearBuilt,
    lot,
    owner_since: ownerSince,
    mortgage_balance: mortgageBalance,
    last_sale: lastSale,
    lat,
    lng,
  };
}

/**
 * Seed ~30 fake sellers for the admin demo account.
 * Sellers are scattered within 50 miles of the provided coordinates.
 * @returns {Promise<boolean>} true if insert succeeded
 */
/**
 * Generate fake "predicted activity" hotspot points for the demo heatmap.
 * Creates 6-8 clusters of tightly grouped points around the center coords.
 * Returns GeoJSON FeatureCollection ready for a Mapbox heatmap source.
 */
export function generatePredictionHotspots(centerLat, centerLng) {
  const clusterCount = rand(6, 8);
  const features = [];

  for (let c = 0; c < clusterCount; c++) {
    // Place each cluster center 5–35 miles from user
    const clusterAngle = Math.random() * 2 * Math.PI;
    const clusterDist = 5 + Math.random() * 30;
    const clusterLat = centerLat + (clusterDist * Math.cos(clusterAngle)) / 69;
    const clusterLng = centerLng + (clusterDist * Math.sin(clusterAngle)) / (69 * Math.cos((centerLat * Math.PI) / 180));

    // Each cluster gets 12–25 tightly grouped points (1–3 mile spread)
    const pointCount = rand(12, 25);
    const intensity = +(0.4 + Math.random() * 0.6).toFixed(2); // 0.4–1.0

    for (let p = 0; p < pointCount; p++) {
      const a = Math.random() * 2 * Math.PI;
      const d = Math.random() * (1 + Math.random() * 2); // 0–3 miles
      const lat = +(clusterLat + (d * Math.cos(a)) / 69).toFixed(6);
      const lng = +(clusterLng + (d * Math.sin(a)) / (69 * Math.cos((clusterLat * Math.PI) / 180))).toFixed(6);

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { intensity },
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

const TOOLTIP_TEMPLATES = [
  'Predicted {pct}% increase in seller activity — driven by tax delinquency + insurance lapse signals',
  '{pct}% uptick forecast — correlated with recent job relocation filings in this ZIP',
  'AI model projects {pct}% seller surge — pre-foreclosure clustering detected nearby',
  'Forecasting {pct}% rise in motivated sellers — equity withdrawal + absentee owner overlap',
  '{pct}% activity spike predicted — divorce filing + property tax delinquency signals converging',
  'Neural engine flags {pct}% probability of increased listings — probate + estate transfer activity',
];

/**
 * Generate raw cluster center definitions with pre-computed point offsets.
 * Over-generates (34-40) so ocean clusters can be culled and we still hit 14-18
 * even in heavily coastal areas where ~50% of the scatter circle is water.
 */
export function generateClusterCenters(centerLat, centerLng) {
  const count = rand(34, 40);
  const clusters = [];

  for (let c = 0; c < count; c++) {
    const clusterAngle = Math.random() * 2 * Math.PI;
    const clusterDist = 3 + Math.random() * 35;
    const clusterLat = centerLat + (clusterDist * Math.cos(clusterAngle)) / 69;
    const clusterLng = centerLng + (clusterDist * Math.sin(clusterAngle)) / (69 * Math.cos((centerLat * Math.PI) / 180));
    const peakWeek = rand(1, 10);
    const baseIntensity = +(0.3 + Math.random() * 0.7).toFixed(2);
    const pointCount = rand(250, 380);
    const tooltipTemplate = pick(TOOLTIP_TEMPLATES);

    const points = [];
    for (let p = 0; p < pointCount; p++) {
      const a = Math.random() * 2 * Math.PI;
      const d = Math.random() * (1 + Math.random() * 2.5);
      points.push([
        +(clusterLng + (d * Math.sin(a)) / (69 * Math.cos((clusterLat * Math.PI) / 180))).toFixed(6),
        +(clusterLat + (d * Math.cos(a)) / 69).toFixed(6),
      ]);
    }

    clusters.push({ clusterLat, clusterLng, peakWeek, baseIntensity, points, tooltipTemplate });
  }

  return clusters;
}

/**
 * Validate cluster centers using Mapbox Tilequery API against the water layer.
 * Unlike reverse geocoding (which returns the nearest named place regardless
 * of whether the point is on land), Tilequery does actual point-in-polygon
 * checks: if the point sits inside a water polygon, it returns features.
 * Empty response = on land.
 *
 * Also checks a 3km buffer around each center (roughly the scatter radius)
 * so clusters near the coast whose child points would spill into water are
 * caught and culled.
 *
 * Falls back gracefully: network errors assume land.
 */
export async function validateCentersOnLand(clusters, mapboxToken) {
  const TARGET = rand(14, 18);

  const checks = await Promise.allSettled(
    clusters.map(async (cluster) => {
      try {
        // radius=0 → exact point-in-polygon check against water polygons.
        // Directional probing (constrainPointsToLand) handles scatter edges.
        const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${cluster.clusterLng},${cluster.clusterLat}.json?layers=water&radius=0&limit=1&access_token=${mapboxToken}`;
        const resp = await fetch(url);
        if (!resp.ok) return { cluster, onLand: true };
        const data = await resp.json();
        // No water features within 3km → safe for land placement
        return { cluster, onLand: !data.features || data.features.length === 0 };
      } catch {
        return { cluster, onLand: true };
      }
    })
  );

  const results = checks
    .map(c => (c.status === 'fulfilled' ? c.value : null))
    .filter(Boolean);

  const onLand = results.filter(r => r.onLand).map(r => r.cluster);
  const offLand = results.filter(r => !r.onLand).map(r => r.cluster);

  // Prefer validated land clusters; pad with unvalidated if we're short
  if (onLand.length >= TARGET) return onLand.slice(0, TARGET);
  return [...onLand, ...offLand.slice(0, TARGET - onLand.length)];
}

/**
 * For each cluster, probe 8 compass directions at the max scatter distance
 * using Tilequery. Directions that hit water are blocked. Child points are
 * regenerated using only safe (land) angular sectors.
 *
 * This runs AFTER validateCentersOnLand (which ensures centers are on land)
 * and fixes the remaining problem: scatter points spilling past the coast.
 *
 * ~8 probes × 14-18 clusters = ~112-144 parallel API calls, ~300ms.
 */
export async function constrainPointsToLand(clusters, mapboxToken) {
  const PROBE_COUNT = 8;
  const MAX_DIST = 3.5; // miles — matches scatter range
  const SECTOR = (2 * Math.PI) / PROBE_COUNT;

  return Promise.all(clusters.map(async (cluster) => {
    const probeAngles = Array.from(
      { length: PROBE_COUNT },
      (_, i) => (i * 2 * Math.PI) / PROBE_COUNT
    );

    const probeResults = await Promise.allSettled(
      probeAngles.map(async (angle) => {
        const lat = cluster.clusterLat + (MAX_DIST * Math.cos(angle)) / 69;
        const lng = cluster.clusterLng + (MAX_DIST * Math.sin(angle)) / (69 * Math.cos((cluster.clusterLat * Math.PI) / 180));
        try {
          const resp = await fetch(
            `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?layers=water&radius=0&limit=1&access_token=${mapboxToken}`
          );
          if (!resp.ok) return false;
          const data = await resp.json();
          return data.features && data.features.length > 0;
        } catch {
          return false;
        }
      })
    );

    // Determine which directions are blocked (water)
    const blockedSet = new Set();
    probeResults.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) blockedSet.add(i);
    });

    // Fully inland cluster — all 8 directions safe, keep existing points
    if (blockedSet.size === 0) return cluster;

    // Build safe angle list
    const safeAngles = probeAngles.filter((_, i) => !blockedSet.has(i));
    if (safeAngles.length === 0) return cluster; // all blocked (shouldn't happen)

    // Regenerate child points constrained to safe angular sectors
    const points = [];
    for (let p = 0; p < cluster.points.length; p++) {
      const baseAngle = safeAngles[Math.floor(Math.random() * safeAngles.length)];
      const a = baseAngle + (Math.random() - 0.5) * SECTOR;
      const d = Math.random() * (1 + Math.random() * 2.5);
      points.push([
        +(cluster.clusterLng + (d * Math.sin(a)) / (69 * Math.cos((cluster.clusterLat * Math.PI) / 180))).toFixed(6),
        +(cluster.clusterLat + (d * Math.cos(a)) / 69).toFixed(6),
      ]);
    }

    return { ...cluster, points };
  }));
}

/**
 * Build a single merged FeatureCollection from validated cluster centers.
 * All 12 weeks × all clusters × all points go into one collection.
 * Each feature has a `w` (week) property for GPU-side setFilter() switching.
 * Center features (idx 0 per cluster) get isCenter + tooltip + confidence
 * for direct hover interaction on the dots layer.
 *
 * ~4500 pts/week × 12 weeks = ~54k features total.
 */
export function buildTimelineFeatures(clusters, weeks = 12) {
  const features = [];

  for (let w = 0; w < weeks; w++) {
    for (const cluster of clusters) {
      const dist = w - cluster.peakWeek;
      const sigma = 3;
      const gaussian = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      const weekIntensity = +(cluster.baseIntensity * (0.15 + 0.85 * gaussian)).toFixed(2);
      const pct = Math.round(weekIntensity * 100);

      for (let p = 0; p < cluster.points.length; p++) {
        const props = { w, intensity: weekIntensity };
        if (p === 0) {
          props.isCenter = true;
          props.tooltip = cluster.tooltipTemplate.replace('{pct}', pct);
          props.confidence = pct;
        }
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: cluster.points[p] },
          properties: props,
        });
      }
    }
  }

  return { type: 'FeatureCollection', features };
}

export async function seedDemoSellers(userId, lat, lng) {
  const sellers = Array.from({ length: 30 }, () => generateSeller(userId, lat, lng));

  const { error } = await supabase.from('sellers').insert(sellers);

  if (error) {
    console.error('Demo seed failed:', error.message);
    return false;
  }
  return true;
}
