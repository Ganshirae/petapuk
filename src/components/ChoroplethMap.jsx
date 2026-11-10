import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Skala hijau 5 kelas untuk % realisasi (aman buta warna: satu hue, beda terang).
export const PCT_CLASSES = [
  { min: 95, color: '#134118', label: '≥ 95%' },
  { min: 85, color: '#288132', label: '85–95%' },
  { min: 75, color: '#90FF4B', label: '75–85%' },
  { min: 60, color: '#BEFB98', label: '60–75%' },
  { min: -Infinity, color: '#E4EEE8', label: '< 60%' }
];
const NO_DATA = '#E5E5E5';

export const pctColor = (v) => (v === null || v === undefined ? NO_DATA : PCT_CLASSES.find((c) => v >= c.min).color);

/**
 * Peta choropleth generik.
 * geojson: FeatureCollection dengan properties.kode
 * values: { [kode]: { pct, label } }
 */
export default function ChoroplethMap({ geojson, values, selected, onSelect, height = 420 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 12,
      opacity: 0.35
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Batas wilayah hanya di-fit ulang ketika geojson berganti (nasional <-> NTB)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;
    const bounds = L.geoJSON(geojson).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [8, 8] });
  }, [geojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;
    if (layerRef.current) map.removeLayer(layerRef.current);

    const layer = L.geoJSON(geojson, {
      style: (f) => {
        const isSel = f.properties.kode === selected;
        return {
          fillColor: pctColor(values[f.properties.kode]?.pct),
          fillOpacity: 0.92,
          color: isSel ? '#090909' : '#FFFFFF',
          weight: isSel ? 2.5 : 0.8
        };
      },
      onEachFeature: (f, l) => {
        const v = values[f.properties.kode];
        const name = document.createElement('div');
        name.innerHTML = '<strong></strong><br><span></span>';
        name.querySelector('strong').textContent = f.properties.nama;
        name.querySelector('span').textContent = v?.label ?? 'Data tidak tersedia';
        l.bindTooltip(name, { sticky: true });
        l.on('click', () => onSelect?.(f.properties.kode));
      }
    }).addTo(map);
    layerRef.current = layer;
  }, [geojson, values, selected, onSelect]);

  return <div ref={containerRef} style={{ height }} className="w-full rounded-2xl border-2 border-gov-border bg-gov-light overflow-hidden shadow-sm" role="img" aria-label="Peta persentase realisasi penyaluran pupuk bersubsidi per wilayah" />;
}
