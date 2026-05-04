import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapSellers } from '../../hooks/useMapSellers';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/adminConfig';
import {
  seedDemoSellers,
  generateClusterCenters,
  validateCentersOnLand,
  constrainPointsToLand,
  buildTimelineFeatures,
} from '../../lib/seedDemoData';
import { supabase } from '../../lib/supabase';
import { fmt$ } from '../../utils/format';
import { TRIGGER_WEIGHTS } from '../../lib/neural';
import LoadingSpinner from '../../components/LoadingSpinner';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const DEFAULT_ZOOM = 11;

const TRIGGER_OPTIONS = ['All', ...Object.keys(TRIGGER_WEIGHTS)];

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

const WEEK_LABELS = [
  'Jan W1', 'Jan W2', 'Jan W3', 'Jan W4',
  'Feb W1', 'Feb W2', 'Feb W3', 'Feb W4',
  'Mar W1', 'Mar W2', 'Mar W3', 'Mar W4',
];

export default function MapPage() {
  const { user } = useAuth();
  const { data: sellers, loading, refetch } = useMapSellers();
  const admin = isAdmin(user);

  // Geolocation state
  const [geoStatus, setGeoStatus] = useState('pending');
  const [userCoords, setUserCoords] = useState(null);

  // Filter state
  const [likelihoodMin, setLikelihoodMin] = useState(0);
  const [triggerFilter, setTriggerFilter] = useState('All');
  const [outreachFilter, setOutreachFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Map + panel state
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Admin-only state
  const [mapStyle, setMapStyle] = useState('light');
  const [timelineWeek, setTimelineWeek] = useState(0);
  const [timelinePlaying, setTimelinePlaying] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const seedCalledRef = useRef(false);
  const sellersRef = useRef([]);
  const timelineDataRef = useRef(null);
  const tooltipRef = useRef(null);

  // --- Request geolocation on mount ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => {
        setGeoStatus('denied');
      }
    );
  }, []);

  // --- Admin seed: run once when coords + user are available ---
  useEffect(() => {
    if (!user || !userCoords || seedCalledRef.current) return;
    if (!admin) return;

    seedCalledRef.current = true;

    (async () => {
      const { data: existing } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.uid)
        .limit(1);

      if (existing && existing.length > 0) return;

      const ok = await seedDemoSellers(user.uid, userCoords.lat, userCoords.lng);
      if (ok) refetch();
    })();
  }, [user, userCoords, refetch, admin]);

  // --- Filtering ---
  const getFiltered = useCallback(() => {
    let list = sellers;
    if (likelihoodMin > 0) {
      list = list.filter(s => s.likelihood >= likelihoodMin);
    }
    if (triggerFilter !== 'All') {
      list = list.filter(s => s.trigger === triggerFilter);
    }
    if (outreachFilter === 'outreach') {
      list = list.filter(s => s.inOutreach);
    } else if (outreachFilter === 'not_started') {
      list = list.filter(s => !s.inOutreach);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sellers, likelihoodMin, triggerFilter, outreachFilter, search]);

  // --- Shared layer-addition function (called on every style.load) ---
  const addMapLayers = useCallback((map) => {
    // Seller heatmap
    map.addSource('sellers-heat', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: 'sellers-heatmap',
      type: 'heatmap',
      source: 'sellers-heat',
      paint: {
        'heatmap-weight': [
          'interpolate', ['linear'], ['get', 'likelihood'],
          0, 0.1, 50, 0.4, 100, 1,
        ],
        'heatmap-intensity': 0.6,
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 20, 13, 40],
        'heatmap-opacity': 0.5,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(34,197,94,0)',
          0.2, 'rgba(34,197,94,0.15)',
          0.4, 'rgba(34,197,94,0.3)',
          0.6, 'rgba(74,222,128,0.5)',
          0.8, 'rgba(22,163,74,0.7)',
          1, 'rgba(22,163,94,0.9)',
        ],
      },
    });

    // Admin-only layers
    if (admin) {
      // Seller cluster source + layers
      map.addSource('sellers-clusters', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'sellers-clusters',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#22c55e',
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 32],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'sellers-clusters',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'sellers-clusters',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'tier'],
            'high', '#22c55e',
            'mid', '#6b7280',
            'low', '#d1d5db',
            '#6b7280',
          ],
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Prediction source — single FeatureCollection, all 12 weeks merged.
      // Data may arrive async (after land validation); starts empty if not ready.
      const predictionData = timelineDataRef.current || { type: 'FeatureCollection', features: [] };

      map.addSource('prediction-heat', {
        type: 'geojson',
        data: predictionData,
      });

      // Prediction heatmap layer — filtered by week, GPU-side
      map.addLayer({
        id: 'prediction-heatmap',
        type: 'heatmap',
        source: 'prediction-heat',
        filter: ['==', ['get', 'w'], 0],
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 13, 0.8],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 25, 13, 50],
          'heatmap-opacity': 0.45,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(251,146,60,0)',
            0.15, 'rgba(251,146,60,0.1)',
            0.3, 'rgba(249,115,22,0.25)',
            0.5, 'rgba(234,88,12,0.4)',
            0.7, 'rgba(220,38,38,0.55)',
            1, 'rgba(185,28,28,0.7)',
          ],
        },
      });

      // Prediction dots — individual activity markers on top of heatmap.
      // Fade in at zoom 10+, color/size driven by intensity.
      map.addLayer({
        id: 'prediction-dots',
        type: 'circle',
        source: 'prediction-heat',
        filter: ['==', ['get', 'w'], 0],
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            8, ['interpolate', ['linear'], ['get', 'intensity'], 0.15, 1, 1, 2.5],
            11, ['interpolate', ['linear'], ['get', 'intensity'], 0.15, 3, 1, 5],
            14, ['interpolate', ['linear'], ['get', 'intensity'], 0.15, 4, 1, 7],
          ],
          'circle-color': [
            'interpolate', ['linear'], ['get', 'intensity'],
            0.15, '#fbbf24',
            0.4, '#fb923c',
            0.65, '#f97316',
            0.85, '#ef4444',
            1.0, '#dc2626',
          ],
          'circle-opacity': [
            'interpolate', ['linear'], ['zoom'],
            8, 0,
            10, 0.45,
            12, 0.8,
          ],
          'circle-stroke-width': 0.5,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
          'circle-stroke-opacity': [
            'interpolate', ['linear'], ['zoom'],
            8, 0,
            10, 0.4,
            12, 0.7,
          ],
          'circle-blur': 0.15,
        },
      });
    }

    // Populate seller data from current filter state
    const filtered = sellersRef.current;
    const heatGeo = {
      type: 'FeatureCollection',
      features: filtered.map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: { likelihood: s.likelihood, id: s.id },
      })),
    };
    const heatSrc = map.getSource('sellers-heat');
    if (heatSrc) heatSrc.setData(heatGeo);

    if (admin) {
      const clusterGeo = {
        type: 'FeatureCollection',
        features: filtered.map(s => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
          properties: { id: s.id, tier: s.tier, likelihood: s.likelihood },
        })),
      };
      const clusterSrc = map.getSource('sellers-clusters');
      if (clusterSrc) clusterSrc.setData(clusterGeo);
    }

    setMapReady(true);
  }, [admin]);

  // --- Map initialization ---
  useEffect(() => {
    if (geoStatus !== 'granted' || !userCoords) return;
    if (loading || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[mapStyle],
      center: [userCoords.lng, userCoords.lat],
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('style.load', () => {
      addMapLayers(map);
    });

    // Admin cluster + prediction interactions
    if (admin) {
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('sellers-clusters').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      map.on('click', 'unclustered-point', (e) => {
        const fId = e.features[0].properties.id;
        const seller = sellersRef.current.find(s => s.id === fId);
        if (seller) {
          setSelectedSeller(seller);
          setPanelOpen(true);
        }
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

      // Prediction dot hover → tooltip
      map.on('mouseenter', 'prediction-dots', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0];
        const coords = f.geometry.coordinates.slice();
        const props = f.properties;

        if (tooltipRef.current) tooltipRef.current.remove();

        // Center features get rich AI tooltip; regular dots get intensity readout
        const html = props.isCenter
          ? `<div class="app-map-tooltip-badge">AI Prediction</div>` +
            `<div class="app-map-tooltip-text">${props.tooltip}</div>` +
            `<div class="app-map-tooltip-confidence">${props.confidence}% confidence</div>`
          : `<div class="app-map-tooltip-badge">Predicted Activity</div>` +
            `<div class="app-map-tooltip-confidence">${Math.round(props.intensity * 100)}% intensity</div>`;

        tooltipRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'app-map-prediction-tooltip',
          maxWidth: '280px',
        })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });

      map.on('mouseleave', 'prediction-dots', () => {
        map.getCanvas().style.cursor = '';
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geoStatus, userCoords, loading, admin, addMapLayers, mapStyle]);

  // --- Async timeline data: generate centers, validate on land, build features ---
  useEffect(() => {
    if (!admin || !userCoords || timelineDataRef.current) return;
    let cancelled = false;

    (async () => {
      const centers = generateClusterCenters(userCoords.lat, userCoords.lng);
      const validated = await validateCentersOnLand(centers, MAPBOX_TOKEN);
      if (cancelled) return;
      const constrained = await constrainPointsToLand(validated, MAPBOX_TOKEN);
      if (cancelled) return;

      timelineDataRef.current = buildTimelineFeatures(constrained);

      // Push data into source if map already loaded (one-time ~80-150ms setData)
      const map = mapRef.current;
      if (map && map.getSource('prediction-heat')) {
        map.getSource('prediction-heat').setData(timelineDataRef.current);
      }
    })();

    return () => { cancelled = true; };
  }, [admin, userCoords]);

  // --- Style toggle handler ---
  const handleStyleChange = useCallback((style) => {
    setMapStyle(style);
    const map = mapRef.current;
    if (map) {
      setMapReady(false);
      map.setStyle(MAP_STYLES[style]);
    }
  }, []);

  // --- Update heatmap + clusters when filters or data change ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const filtered = getFiltered();
    sellersRef.current = filtered;

    const heatGeo = {
      type: 'FeatureCollection',
      features: filtered.map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: { likelihood: s.likelihood, id: s.id },
      })),
    };

    const heatSrc = map.getSource('sellers-heat');
    if (heatSrc) heatSrc.setData(heatGeo);

    if (admin) {
      const clusterGeo = {
        type: 'FeatureCollection',
        features: filtered.map(s => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
          properties: { id: s.id, tier: s.tier, likelihood: s.likelihood },
        })),
      };
      const clusterSrc = map.getSource('sellers-clusters');
      if (clusterSrc) clusterSrc.setData(clusterGeo);
    }
  }, [getFiltered, mapReady, admin]);

  // --- Timeline week change: swap filter on heatmap + dots (GPU-side, ~0ms) ---
  useEffect(() => {
    if (!admin || !mapReady) return;
    const map = mapRef.current;
    if (!map || !timelineDataRef.current) return;

    const weekFilter = ['==', ['get', 'w'], timelineWeek];
    if (map.getLayer('prediction-heatmap')) map.setFilter('prediction-heatmap', weekFilter);
    if (map.getLayer('prediction-dots')) map.setFilter('prediction-dots', weekFilter);

    // Clear stale tooltip
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
  }, [timelineWeek, admin, mapReady]);

  // --- Timeline auto-play ---
  useEffect(() => {
    if (!timelinePlaying) return;
    const interval = setInterval(() => {
      setTimelineWeek(w => (w + 1) % 12);
    }, 1200);
    return () => clearInterval(interval);
  }, [timelinePlaying]);

  // --- Close panel ---
  function closePanel() {
    setPanelOpen(false);
    setSelectedSeller(null);
  }

  // --- Geo denied screen ---
  if (geoStatus === 'denied') {
    return (
      <div className="app-map-page">
        <div className="app-map-geo-denied">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <h2>Location permission required</h2>
          <p>Please enable location access in your browser settings to use the map view.</p>
        </div>
      </div>
    );
  }

  // --- Geo pending screen ---
  if (geoStatus === 'pending') {
    return (
      <div className="app-map-page">
        <div className="app-map-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const filtered = getFiltered();

  return (
    <div className="app-map-page">
      {loading && (
        <div className="app-map-loading">
          <LoadingSpinner />
        </div>
      )}

      {/* Filter bar */}
      <div className="app-map-filters" style={loading ? { display: 'none' } : undefined}>
        <div className="app-map-filter-group">
          <label className="app-map-filter-label">Likelihood</label>
          <input
            type="range"
            className="app-map-slider"
            min="0"
            max="100"
            value={likelihoodMin}
            onChange={e => setLikelihoodMin(Number(e.target.value))}
          />
          <span className="app-map-slider-value">{likelihoodMin}+</span>
        </div>

        <div className="app-map-filter-group">
          <label className="app-map-filter-label">Trigger</label>
          <select
            className="app-map-select"
            value={triggerFilter}
            onChange={e => setTriggerFilter(e.target.value)}
          >
            {TRIGGER_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="app-map-filter-group app-map-pills">
          {[
            { key: 'all', label: 'All' },
            { key: 'outreach', label: 'In outreach' },
            { key: 'not_started', label: 'Not started' },
          ].map(f => (
            <button
              key={f.key}
              className={`app-map-pill${outreachFilter === f.key ? ' active' : ''}`}
              onClick={() => setOutreachFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="app-map-filter-group app-map-search-group">
          <input
            type="text"
            className="app-map-search"
            placeholder="Search address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="app-map-filter-count">
          {filtered.length} seller{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Map container */}
      <div className="app-map-container" ref={mapContainerRef} />

      {/* Admin: Map style toggle */}
      {admin && (
        <div className="app-map-style-toggle">
          {Object.keys(MAP_STYLES).map(key => (
            <button
              key={key}
              className={`app-map-style-btn${mapStyle === key ? ' active' : ''}`}
              onClick={() => handleStyleChange(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="app-map-legend">
        <div className="app-map-legend-title">Likelihood</div>
        <div className="app-map-legend-row">
          <span className="app-map-legend-dot high" />
          <span>High (75+)</span>
        </div>
        <div className="app-map-legend-row">
          <span className="app-map-legend-dot mid" />
          <span>Mid (50–74)</span>
        </div>
        <div className="app-map-legend-row">
          <span className="app-map-legend-dot low" />
          <span>Low (&lt;50)</span>
        </div>
        {admin && (
          <>
            <div className="app-map-legend-divider" />
            <div className="app-map-legend-title">Predicted Activity</div>
            <div className="app-map-legend-row">
              <span className="app-map-legend-dot prediction-high" />
              <span>High surge</span>
            </div>
            <div className="app-map-legend-row">
              <span className="app-map-legend-dot prediction-low" />
              <span>Moderate surge</span>
            </div>
          </>
        )}
      </div>

      {/* Admin: Timeline slider */}
      {admin && (
        <div className="app-map-timeline">
          <button
            className="app-map-timeline-play"
            onClick={() => setTimelinePlaying(p => !p)}
            aria-label={timelinePlaying ? 'Pause' : 'Play'}
          >
            {timelinePlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>
          <input
            type="range"
            className="app-map-timeline-slider"
            min="0"
            max="11"
            value={timelineWeek}
            onChange={e => {
              setTimelinePlaying(false);
              setTimelineWeek(Number(e.target.value));
            }}
          />
          <div className="app-map-timeline-labels">
            {WEEK_LABELS.map((label, i) => (
              <span
                key={i}
                className={`app-map-timeline-label${i === timelineWeek ? ' active' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Side panel */}
      <div className={`app-map-panel${panelOpen ? ' open' : ''}`}>
        {selectedSeller && (
          <>
            <button className="app-map-panel-close" onClick={closePanel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="app-map-panel-header">
              <h2 className="app-map-panel-address">{selectedSeller.address}</h2>
              <p className="app-map-panel-city">{selectedSeller.city}</p>
              <div className={`app-map-panel-badge ${selectedSeller.tier}`}>
                {selectedSeller.likelihood}% likelihood
              </div>
            </div>

            {/* Score breakdown */}
            <div className="app-map-panel-section">
              <h3 className="app-map-panel-section-title">Score Breakdown</h3>
              {[
                { label: 'Base Score', value: selectedSeller.components.baseScore },
                { label: 'Recency', value: selectedSeller.components.recency },
                { label: 'Equity', value: selectedSeller.components.equity },
                { label: 'Trigger Weight', value: selectedSeller.components.triggerWeight },
              ].map(comp => (
                <div className="app-map-score-row" key={comp.label}>
                  <span className="app-map-score-label">{comp.label}</span>
                  <div className="app-map-score-bar">
                    <div
                      className="app-map-score-bar-fill"
                      style={{ width: `${comp.value}%` }}
                    />
                  </div>
                  <span className="app-map-score-value">{comp.value}</span>
                </div>
              ))}
            </div>

            {/* Property stats */}
            <div className="app-map-panel-section">
              <h3 className="app-map-panel-section-title">Property Details</h3>
              <div className="app-map-stats-grid">
                <div className="app-map-stat">
                  <span className="app-map-stat-value">{fmt$(selectedSeller.est)}</span>
                  <span className="app-map-stat-label">Est. Value</span>
                </div>
                <div className="app-map-stat">
                  <span className="app-map-stat-value">{selectedSeller.beds}/{selectedSeller.baths}</span>
                  <span className="app-map-stat-label">Beds/Baths</span>
                </div>
                <div className="app-map-stat">
                  <span className="app-map-stat-value">{selectedSeller.sqft?.toLocaleString()}</span>
                  <span className="app-map-stat-label">Sq Ft</span>
                </div>
                <div className="app-map-stat">
                  <span className="app-map-stat-value">{selectedSeller.days}d</span>
                  <span className="app-map-stat-label">Days Ago</span>
                </div>
              </div>
            </div>

            {/* Trigger + status */}
            <div className="app-map-panel-section">
              <div className="app-map-panel-meta">
                <span className="app-map-panel-meta-label">Trigger</span>
                <span>{selectedSeller.trigger}</span>
              </div>
              <div className="app-map-panel-meta">
                <span className="app-map-panel-meta-label">Status</span>
                <span>{selectedSeller.inOutreach ? 'In outreach' : 'Not started'}</span>
              </div>
              {selectedSeller.agent && (
                <div className="app-map-panel-meta">
                  <span className="app-map-panel-meta-label">Agent</span>
                  <span>{selectedSeller.agent}</span>
                </div>
              )}
            </div>

            <Link to={`/app/pipeline/${selectedSeller.id}`} className="app-map-panel-link">
              View full details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
