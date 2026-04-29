import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { sellerCoords } from '../data/sellers';

const FEATURED_ID = 7;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const HOME = { center: [-118.48, 34.055], zoom: 10.8, pitch: 0, bearing: 0 };
const MID = { center: [-118.45, 34.065], zoom: 12.0, pitch: 15, bearing: -10 };
const FOCUSED = { center: sellerCoords[FEATURED_ID], zoom: 16.2, pitch: 62, bearing: -30 };

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function subProgress(progress, start, end) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}
function lerpCamera(a, b, t) {
  const e = easeInOut(t);
  return {
    center: [lerp(a.center[0], b.center[0], e), lerp(a.center[1], b.center[1], e)],
    zoom: lerp(a.zoom, b.zoom, e),
    pitch: lerp(a.pitch, b.pitch, e),
    bearing: lerp(a.bearing, b.bearing, e),
  };
}

function scoreCls(s) {
  return s >= 90 ? 'high' : s >= 85 ? 'mid' : 'low';
}

function addPing(el) {
  const ping = document.createElement('div');
  ping.className = 'map-marker-ping';
  el.style.position = 'relative';
  el.appendChild(ping);
  setTimeout(() => ping.remove(), 900);
}

export default function ScrollMap({ sellers, onAddToPipeline }) {
  const runwayRef = useRef(null);
  const stickyRef = useRef(null);
  const containerRef = useRef(null);
  const glWrapRef = useRef(null);
  const mapGlRef = useRef(null);
  const coverRef = useRef(null);
  const progressTrackRef = useRef(null);
  const progressFillRef = useRef(null);
  const phaseLabelRef = useRef(null);
  const propertyCardRef = useRef(null);
  const scrollHintRef = useRef(null);
  const overlayRef = useRef(null);
  const statusRef = useRef(null);

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clickCursorElRef = useRef(null);
  const clickCursorMarkerRef = useRef(null);
  const clickCursorAddedRef = useRef(false);
  const heatmapAddedRef = useRef(false);
  const keepaliveRef = useRef(null);
  const stateRef = useRef({
    lastProgress: -1,
    lastPhase: '',
    visibleMarkerCount: 0,
    lastCameraKey: '',
    scrollLocked: false,
  });

  const mapCoverUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-118.48,34.055,10.8/960x480@2x?access_token=${MAPBOX_TOKEN}`;

  const triggerAddToPipeline = useCallback(() => {
    const overlay = overlayRef.current;
    const state = stateRef.current;
    const map = mapRef.current;
    const markers = markersRef.current;
    const runway = runwayRef.current;
    const cover = coverRef.current;
    const propertyCard = propertyCardRef.current;
    const phaseLabel = phaseLabelRef.current;
    const progressTrack = progressTrackRef.current;
    const scrollHint = scrollHintRef.current;
    const glWrap = glWrapRef.current;
    const sticky = stickyRef.current;
    const container = containerRef.current;

    if (!overlay || !map) return;

    overlay.classList.add('active');
    if (keepaliveRef.current) {
      clearInterval(keepaliveRef.current);
      keepaliveRef.current = null;
    }

    setTimeout(() => {
      state.scrollLocked = false;
      window.__mapScrollLocked = false;
      document.documentElement.style.overflow = '';

      map.jumpTo({ center: HOME.center, zoom: HOME.zoom, pitch: HOME.pitch, bearing: HOME.bearing });

      markers.forEach(m => {
        if (m.addedToMap) {
          m.el.classList.remove('visible', 'faded', 'featured');
          m.marker.remove();
          m.addedToMap = false;
        }
      });
      state.visibleMarkerCount = 0;

      if (clickCursorElRef.current) clickCursorElRef.current.classList.remove('visible');
      if (clickCursorMarkerRef.current) {
        clickCursorMarkerRef.current.remove();
        clickCursorAddedRef.current = false;
      }

      if (heatmapAddedRef.current) {
        try { map.setPaintProperty('seller-heatmap-layer', 'heatmap-opacity', 0); } catch (e) { /* ignore */ }
      }

      if (cover) cover.style.opacity = '1';
      if (propertyCard) propertyCard.classList.remove('visible');
      if (phaseLabel) phaseLabel.classList.remove('visible');
      if (progressTrack) progressTrack.style.opacity = '0';
      if (scrollHint) scrollHint.classList.remove('visible', 'lock-prompt');
      if (glWrap) glWrap.style.height = '';
      if (sticky) sticky.style.maxWidth = '';
      if (container) { container.style.borderRadius = ''; container.style.boxShadow = ''; }
      state.lastProgress = -1;
      state.lastCameraKey = '';
      state.lastPhase = '';

      runway.style.height = '0';
      runway.style.overflow = 'hidden';
      runway.style.padding = '0';

      // Scroll to the dashboard (next section after the map) instead of the top
      const nextSection = runway.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 1000);

    setTimeout(() => {
      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
          if (onAddToPipeline) onAddToPipeline();
        }, 400);
      }, 500);
    }, 1400);
  }, [onAddToPipeline]);

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapGlRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: HOME.center,
      zoom: HOME.zoom,
      pitch: HOME.pitch,
      bearing: HOME.bearing,
      attributionControl: false,
      fadeDuration: 0,
      maxZoom: 17,
      minZoom: 9,
      interactive: false,
    });

    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();

    mapRef.current = map;

    // Recover from WebGL context loss
    const canvas = map.getCanvas();
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      map.triggerRepaint();
    });

    map.on('style.load', () => {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(l => l.type === 'symbol' && l.layout['text-field']);

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#e0e0e0',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.5,
        },
      }, labelLayerId ? labelLayerId.id : undefined);

      const fc = sellerCoords[FEATURED_ID];
      const dLng = 0.00025, dLat = 0.00013;
      map.addSource('featured-building', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [fc[0] - dLng, fc[1] - dLat],
              [fc[0] + dLng, fc[1] - dLat],
              [fc[0] + dLng, fc[1] + dLat],
              [fc[0] - dLng, fc[1] + dLat],
              [fc[0] - dLng, fc[1] - dLat],
            ]],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: 'featured-building-glow',
        type: 'fill-extrusion',
        source: 'featured-building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#22c55e',
          'fill-extrusion-height': 8,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.25,
        },
      });

      map.addLayer({
        id: 'featured-building-highlight',
        type: 'fill-extrusion',
        source: 'featured-building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#22c55e',
          'fill-extrusion-height': 12,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.7,
        },
      });

      // Heatmap
      const features = sellers.map(s => {
        const coords = sellerCoords[s.id];
        if (!coords) return null;
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coords },
          properties: { score: s.score, est: s.est },
        };
      }).filter(Boolean);

      map.addSource('seller-heatmap', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });

      map.addLayer({
        id: 'seller-heatmap-layer',
        type: 'heatmap',
        source: 'seller-heatmap',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'score'], 75, 0.3, 100, 1],
          'heatmap-intensity': 0.6,
          'heatmap-radius': 40,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(34,197,94,0)',
            0.2, 'rgba(34,197,94,0.15)',
            0.4, 'rgba(34,197,94,0.3)',
            0.6, 'rgba(34,197,94,0.45)',
            0.8, 'rgba(74,222,128,0.6)',
            1, 'rgba(74,222,128,0.8)',
          ],
          'heatmap-opacity': 0,
        },
      }, '3d-buildings');

      heatmapAddedRef.current = true;
    });

    // Build markers
    const featuredSeller = sellers.find(s => s.id === FEATURED_ID);
    const otherSellers = sellers.filter(s => s.id !== FEATURED_ID);
    const fc = sellerCoords[FEATURED_ID];
    otherSellers.sort((a, b) => {
      const ca = sellerCoords[a.id], cb = sellerCoords[b.id];
      if (!ca || !cb) return 0;
      const da = Math.hypot(ca[0] - fc[0], ca[1] - fc[1]);
      const db = Math.hypot(cb[0] - fc[0], cb[1] - fc[1]);
      return db - da;
    });
    const markersSorted = [...otherSellers, featuredSeller].filter(Boolean);

    const markerArr = [];
    markersSorted.forEach(s => {
      const coords = sellerCoords[s.id];
      if (!coords) return;
      const el = document.createElement('div');
      el.className = 'map-marker ' + scoreCls(s.score);
      el.dataset.sellerId = s.id;
      const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords);
      markerArr.push({ marker, el, seller: s, coords, addedToMap: false });
    });
    markersRef.current = markerArr;

    // Click cursor marker on the featured building
    const clickCursorEl = document.createElement('div');
    clickCursorEl.className = 'map-click-cursor';
    clickCursorEl.innerHTML = `
      <div class="map-click-cursor-label">Add to Signal Pipeline</div>
      <div class="map-click-cursor-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 3l14 8.5L12 14l-2.5 7L5 3z" fill="#0A0A0A" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <div class="map-click-ripple"></div>
      </div>
    `;
    clickCursorElRef.current = clickCursorEl;

    const clickCursorMarker = new mapboxgl.Marker({
      element: clickCursorEl,
      anchor: 'bottom',
      offset: [0, -20],
    }).setLngLat(sellerCoords[FEATURED_ID]);
    clickCursorMarkerRef.current = clickCursorMarker;

    clickCursorEl.addEventListener('click', () => {
      triggerAddToPipelineRef.current();
    });

    // Scroll-driven update
    function getScrollProgress() {
      if (!runwayRef.current) return 0;
      const rect = runwayRef.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollable = rect.height - viewH;
      if (scrollable <= 0) return 0;
      const scrolled = -rect.top;
      return Math.max(0, Math.min(1, scrolled / scrollable));
    }

    function updateMapFromScroll(progress) {
      const state = stateRef.current;
      const markers = markersRef.current;
      const progressFill = progressFillRef.current;
      const cover = coverRef.current;
      const progressTrack = progressTrackRef.current;
      const scrollHint = scrollHintRef.current;
      const phaseLabel = phaseLabelRef.current;
      const statusEl = statusRef.current;
      const propertyCard = propertyCardRef.current;
      const glWrap = glWrapRef.current;
      const sticky = stickyRef.current;
      const containerEl = containerRef.current;

      if (!progressFill) return;

      progressFill.style.width = (progress * 100) + '%';

      // Map expansion (0.02 → 0.15)
      const expandT = easeInOut(subProgress(progress, 0.02, 0.15));
      if (expandT > 0) {
        const baseH = window.innerWidth <= 768 ? 360 : 480;
        const targetH = Math.max(baseH, window.innerHeight - 300);
        glWrap.style.height = lerp(baseH, targetH, expandT) + 'px';
        const targetW = Math.min(Math.max(960, window.innerWidth - 48), 1200);
        sticky.style.maxWidth = lerp(960, targetW, expandT) + 'px';
        containerEl.style.borderRadius = lerp(12, 8, expandT) + 'px';
        containerEl.style.boxShadow = `0 1px 3px rgba(0,0,0,${lerp(0.04, 0, expandT)}), 0 24px 68px rgba(0,0,0,${lerp(0.06, 0.02, expandT)})`;
        map.resize();
      } else {
        glWrap.style.height = '';
        sticky.style.maxWidth = '';
        containerEl.style.borderRadius = '';
        containerEl.style.boxShadow = '';
      }

      // Phase 0: cover fade
      cover.style.opacity = 1 - subProgress(progress, 0.0, 0.10);

      // Progress track
      progressTrack.style.opacity = progress > 0.02 ? '1' : '0';

      // Scroll hint
      if (progress > 0.03 && progress < 0.20) {
        scrollHint.textContent = 'Scroll to explore \u2193';
        scrollHint.classList.remove('lock-prompt');
        scrollHint.classList.add('visible');
      } else {
        scrollHint.classList.remove('visible', 'lock-prompt');
      }

      // Heatmap opacity
      if (heatmapAddedRef.current) {
        const heatOpacity = progress < 0.10 ? 0
          : progress < 0.25 ? subProgress(progress, 0.10, 0.20)
          : progress < 0.55 ? 1
          : 1 - subProgress(progress, 0.55, 0.70);
        try { map.setPaintProperty('seller-heatmap-layer', 'heatmap-opacity', Math.max(0, Math.min(1, heatOpacity))); } catch (e) { /* ignore */ }
      }

      // Phase labels
      let phaseTxt = '';
      if (progress >= 0.10 && progress < 0.25) {
        phaseTxt = 'Analyzing 47 data streams...';
      } else if (progress >= 0.25 && progress < 0.55) {
        phaseTxt = `Scanning... ${state.visibleMarkerCount} of ${sellers.length} signals`;
      } else if (progress >= 0.55 && progress < 0.85) {
        phaseTxt = 'Highest signal detected';
      } else if (progress >= 0.85) {
        phaseTxt = '';
      }

      if (phaseTxt !== state.lastPhase) {
        state.lastPhase = phaseTxt;
        phaseLabel.textContent = phaseTxt;
        if (phaseTxt) {
          phaseLabel.classList.add('visible');
        } else {
          phaseLabel.classList.remove('visible');
        }
      }

      // Status bar
      if (progress < 0.10) {
        statusEl.textContent = 'Waiting...';
      } else if (progress < 0.25) {
        statusEl.textContent = 'Analyzing...';
      } else if (progress < 0.55) {
        statusEl.textContent = `${state.visibleMarkerCount} of ${sellers.length} signals`;
      } else if (progress < 0.85) {
        statusEl.textContent = 'Signal locked';
      } else {
        statusEl.textContent = `${sellers.length} signals found`;
      }

      // Phase 2: Markers
      const markerProgress = subProgress(progress, 0.25, 0.55);
      const targetMarkerCount = Math.floor(markerProgress * markers.length);

      if (targetMarkerCount > state.visibleMarkerCount) {
        for (let i = state.visibleMarkerCount; i < targetMarkerCount && i < markers.length; i++) {
          const m = markers[i];
          if (!m.addedToMap) {
            m.marker.addTo(map);
            m.addedToMap = true;
            requestAnimationFrame(() => {
              m.el.classList.add('visible');
              addPing(m.el);
            });
          }
        }
        state.visibleMarkerCount = targetMarkerCount;
      }

      if (targetMarkerCount < state.visibleMarkerCount) {
        for (let i = state.visibleMarkerCount - 1; i >= targetMarkerCount && i >= 0; i--) {
          const m = markers[i];
          if (m.addedToMap) {
            m.el.classList.remove('visible', 'faded', 'featured');
            setTimeout(() => {
              if (!m.el.classList.contains('visible')) {
                m.marker.remove();
                m.addedToMap = false;
              }
            }, 350);
          }
        }
        state.visibleMarkerCount = Math.max(0, targetMarkerCount);
      }

      // Phase 3: Fly + fade
      const fadeProgress = subProgress(progress, 0.55, 0.70);
      markers.forEach(m => {
        if (!m.addedToMap) return;
        if (m.seller.id === FEATURED_ID) {
          if (progress >= 0.55) {
            m.el.classList.add('featured');
          } else {
            m.el.classList.remove('featured');
          }
        } else {
          if (fadeProgress > 0 && progress < 1.0) {
            m.el.classList.add('faded');
          } else {
            m.el.classList.remove('faded');
          }
        }
      });

      // Phase 4: Property card + click cursor + scroll lock
      if (progress >= 0.85) {
        propertyCard.classList.add('visible');
        if (!clickCursorAddedRef.current && clickCursorMarkerRef.current) {
          clickCursorMarkerRef.current.addTo(map);
          clickCursorAddedRef.current = true;
          requestAnimationFrame(() => clickCursorElRef.current?.classList.add('visible'));
        }
      } else if (!state.scrollLocked) {
        // Only remove cursor/card if we haven't locked yet — a resize after
        // locking can briefly shift progress below 0.85 and would kill them.
        propertyCard.classList.remove('visible');
        if (clickCursorAddedRef.current && clickCursorElRef.current) {
          clickCursorElRef.current.classList.remove('visible');
          setTimeout(() => {
            if (!clickCursorElRef.current?.classList.contains('visible') && clickCursorMarkerRef.current) {
              clickCursorMarkerRef.current.remove();
              clickCursorAddedRef.current = false;
            }
          }, 400);
        }
      }

      if (progress >= 0.92 && !state.scrollLocked) {
        state.scrollLocked = true;
        window.__mapScrollLocked = true;
        document.documentElement.style.overflow = 'hidden';
        // Keep WebGL context alive while idle in locked state
        if (!keepaliveRef.current) {
          keepaliveRef.current = setInterval(() => {
            if (mapRef.current) mapRef.current.triggerRepaint();
          }, 4000);
        }
      }

      // Camera
      let cam;
      if (progress < 0.25) {
        cam = HOME;
      } else if (progress < 0.55) {
        cam = lerpCamera(HOME, MID, subProgress(progress, 0.25, 0.55));
      } else {
        cam = lerpCamera(MID, FOCUSED, subProgress(progress, 0.55, 0.85));
      }

      const camKey = cam.center[0].toFixed(5) + ',' + cam.center[1].toFixed(5) + ',' +
                     cam.zoom.toFixed(3) + ',' + cam.pitch.toFixed(2) + ',' + cam.bearing.toFixed(2);
      if (camKey !== state.lastCameraKey) {
        state.lastCameraKey = camKey;
        map.jumpTo({ center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing });
      }
    }

    let rafId = null;
    let isInRunway = false;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const progress = getScrollProgress();
        const state = stateRef.current;
        if (progress > 0 || isInRunway) {
          isInRunway = progress > 0 && progress < 1;
          if (Math.abs(progress - state.lastProgress) > 0.001) {
            state.lastProgress = progress;
            updateMapFromScroll(progress);
          }
        }
      });
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && stateRef.current.scrollLocked) {
        document.documentElement.style.overflow = 'hidden';
      }
    }

    function initScrollDrive() {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => { stateRef.current.lastCameraKey = ''; onScroll(); }, { passive: true });
      document.addEventListener('visibilitychange', onVisibilityChange);
      onScroll();
    }

    if (map.loaded()) {
      initScrollDrive();
    } else {
      map.on('load', initScrollDrive);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (keepaliveRef.current) clearInterval(keepaliveRef.current);
      map.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep a stable ref to triggerAddToPipeline for the building label click handler
  const triggerAddToPipelineRef = useRef(triggerAddToPipeline);
  triggerAddToPipelineRef.current = triggerAddToPipeline;

  return (
    <section className="map-scroll-runway" ref={runwayRef}>
      <div className="map-sticky" ref={stickyRef}>
        <div className="map-container" ref={containerRef}>
          <div className="map-header">
            <div className="map-header-left">
              <div className="map-header-dot"></div>
              <span className="map-header-label">LA Westside &middot; Signal Map</span>
            </div>
            <span className="map-header-status" ref={statusRef}>Waiting...</span>
          </div>
          <div className="map-gl-wrap" ref={glWrapRef}>
            <div ref={mapGlRef} style={{ width: '100%', height: '100%' }}></div>
            <div
              className="map-cover"
              ref={coverRef}
              style={{ backgroundImage: `url(${mapCoverUrl})` }}
            ></div>
            <div className="map-progress-track" ref={progressTrackRef}>
              <div className="map-progress-fill" ref={progressFillRef}></div>
            </div>
            <div className="map-phase-label" ref={phaseLabelRef}></div>
            <div className="map-property-card" ref={propertyCardRef}>
              <div className="map-property-badge">
                <div className="map-property-badge-dot"></div>
                HIGHEST SIGNAL &middot; SCORE 96
              </div>
              <div className="map-property-address">1520 Benedict Canyon</div>
              <div className="map-property-city">Beverly Hills</div>
              <div className="map-property-specs">7 bd &middot; 7 ba &middot; 8,100 sqft</div>
              <div className="map-property-grid">
                <div className="map-property-stat">
                  <div className="map-property-stat-label">Est. Value</div>
                  <div className="map-property-stat-value">$8.9M</div>
                </div>
                <div className="map-property-stat">
                  <div className="map-property-stat-label">Signal</div>
                  <div className="map-property-stat-value" style={{ color: 'var(--green)' }}>Listed FSBO</div>
                </div>
                <div className="map-property-stat">
                  <div className="map-property-stat-label">Days</div>
                  <div className="map-property-stat-value">3d</div>
                </div>
                <div className="map-property-stat">
                  <div className="map-property-stat-label">Agent</div>
                  <div className="map-property-stat-value">Lisa Park</div>
                </div>
              </div>
              <button className="map-property-cta" onClick={triggerAddToPipeline}>
                <span className="map-property-cta-dot"></span>
                Add to Signal Pipeline
              </button>
              <div className="map-property-hint">{'\u2191'} Click to continue</div>
            </div>
            <div className="map-scroll-hint" ref={scrollHintRef}>Scroll to explore {'\u2193'}</div>
            <div className="map-transition-overlay" ref={overlayRef}>
              <div className="map-transition-check">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="map-transition-status">Adding to Signal Pipeline...</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
