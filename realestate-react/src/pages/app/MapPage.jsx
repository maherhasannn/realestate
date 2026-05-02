import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapSellers } from '../../hooks/useMapSellers';
import { fmt$ } from '../../utils/format';
import { TRIGGER_WEIGHTS } from '../../lib/neural';
import LoadingSpinner from '../../components/LoadingSpinner';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const DEFAULT_CENTER = [-118.48, 34.055]; // LA
const DEFAULT_ZOOM = 11;

const TRIGGER_OPTIONS = ['All', ...Object.keys(TRIGGER_WEIGHTS)];

export default function MapPage() {
  const { data: sellers, loading } = useMapSellers();

  // Filter state
  const [likelihoodMin, setLikelihoodMin] = useState(0);
  const [triggerFilter, setTriggerFilter] = useState('All');
  const [outreachFilter, setOutreachFilter] = useState('all'); // all | outreach | not_started
  const [search, setSearch] = useState('');

  // Map + panel state
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

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

  // --- Map initialization ---
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Try browser geolocation for initial center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: DEFAULT_ZOOM,
            duration: 1500,
          });
        },
        () => {} // silently fall back to default
      );
    }

    map.on('load', () => {
      // Add empty GeoJSON source for heatmap
      map.addSource('sellers-heat', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Heatmap layer
      map.addLayer({
        id: 'sellers-heatmap',
        type: 'heatmap',
        source: 'sellers-heat',
        paint: {
          'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'likelihood'],
            0, 0.1,
            50, 0.4,
            100, 1,
          ],
          'heatmap-intensity': 0.6,
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            8, 20,
            13, 40,
          ],
          'heatmap-opacity': 0.5,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(34,197,94,0)',
            0.2, 'rgba(34,197,94,0.15)',
            0.4, 'rgba(34,197,94,0.3)',
            0.6, 'rgba(74,222,128,0.5)',
            0.8, 'rgba(22,163,74,0.7)',
            1, 'rgba(22,163,74,0.9)',
          ],
        },
      });

      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // --- Update heatmap + markers when filters or data change ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const filtered = getFiltered();

    // Update GeoJSON source
    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: { likelihood: s.likelihood, id: s.id },
      })),
    };

    const source = map.getSource('sellers-heat');
    if (source) source.setData(geojson);

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Create new markers
    filtered.forEach(seller => {
      const el = document.createElement('div');
      el.className = `app-map-pin ${seller.tier}`;
      if (selectedSeller?.id === seller.id) el.classList.add('selected');

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedSeller(seller);
        setPanelOpen(true);
        // Deselect all, select this one
        markersRef.current.forEach(m => m.getElement().classList.remove('selected'));
        el.classList.add('selected');
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([seller.lng, seller.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [getFiltered, mapReady, selectedSeller?.id]);

  // --- Close panel ---
  function closePanel() {
    setPanelOpen(false);
    setSelectedSeller(null);
    markersRef.current.forEach(m => m.getElement().classList.remove('selected'));
  }

  if (loading) return <LoadingSpinner />;

  const filtered = getFiltered();

  return (
    <div className="app-map-page">
      {/* Filter bar */}
      <div className="app-map-filters">
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
      </div>

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
