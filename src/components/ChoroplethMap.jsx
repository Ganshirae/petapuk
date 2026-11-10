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
 * Menghitung style poligon yang rapi, modern, dan berestetika tinggi.
 * Menghindari garis hitam kasar; menggunakan kontras adaptif, rounded join/cap,
 * dan elevasi visual yang rapi untuk wilayah yang dipilih.
 */
export function getFeatureStyle(f, selectedKode, values) {
  const isSel = f?.properties?.kode === selectedKode;
  const val = values?.[f?.properties?.kode]?.pct;
  const fillColor = pctColor(val);

  if (isSel) {
    // Kontras adaptif untuk wilayah yang dipilih:
    // Jika fill warna hijau tua pekat (≥95%), gunakan border putih bersih agar kontras kuat.
    // Jika fill warna terang/sedang, gunakan hijau tua institusional (#134118) yang rapi dan elegan.
    const isDarkFill = fillColor === '#134118';
    return {
      fillColor,
      fillOpacity: 1.0,
      color: isDarkFill ? '#FFFFFF' : '#134118',
      weight: 2.2,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
      className: 'leaflet-selected-region'
    };
  }

  // State default untuk wilayah tidak terpilih
  return {
    fillColor,
    fillOpacity: 0.88,
    color: '#FFFFFF',
    weight: 0.8,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'leaflet-unselected-region'
  };
}

/**
 * Peta choropleth generik.
 * geojson: FeatureCollection dengan properties.kode
 * values: { [kode]: { pct, label } }
 */
export default function ChoroplethMap({ geojson, values, selected, onSelect, height, className = 'h-[320px] sm:h-[380px] lg:h-[460px]' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const selectedRef = useRef(selected);
  const valuesRef = useRef(values);
  const lastZoomedKodeRef = useRef(selected);

  // Selalu perbarui ref agar listener event Leaflet tidak terkena stale closure
  useEffect(() => {
    selectedRef.current = selected;
    valuesRef.current = values;
  }, [selected, values]);

  // Fungsi zoom / mengarahkan kamera peta ke bounds wilayah target secara halus
  const zoomToFeature = (targetLayer) => {
    const map = mapRef.current;
    if (!map || !targetLayer || !targetLayer.getBounds) return;
    const bounds = targetLayer.getBounds();
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [35, 35],
        maxZoom: 8,
        duration: 0.8
      });
    }
  };

  // Memastikan poligon yang sedang terpilih selalu berada di tumpukan SVG terdepan (tidak terpotong border tetangga)
  const bringSelectedToFront = () => {
    if (!layerRef.current) return;
    layerRef.current.eachLayer((l) => {
      if (l.feature?.properties?.kode === selectedRef.current) {
        l.bringToFront();
      }
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 12,
      opacity: 0.35
    }).addTo(map);
    mapRef.current = map;

    // Trigger invalidateSize after initial render & layout paint
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Watch for container resize (e.g. mobile orientation change, layout shifts)
    let ro;
    if (typeof window !== 'undefined' && window.ResizeObserver && containerRef.current) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(containerRef.current);
    }

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Batas wilayah hanya di-fit ulang ketika geojson berganti (nasional <-> NTB)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;
    lastZoomedKodeRef.current = null;
    map.invalidateSize();
    const bounds = L.geoJSON(geojson).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [12, 12] });
    }

    const t = setTimeout(() => {
      if (mapRef.current && bounds.isValid()) {
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(bounds, { padding: [12, 12] });
      }
    }, 120);

    return () => clearTimeout(t);
  }, [geojson]);

  // Inisialisasi layer GeoJSON saat dataset wilayah berubah (mis. Nasional <-> NTB)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;
    if (layerRef.current) map.removeLayer(layerRef.current);

    const layer = L.geoJSON(geojson, {
      style: (f) => getFeatureStyle(f, selectedRef.current, valuesRef.current),
      onEachFeature: (f, l) => {
        // Gunakan fungsi getter dinamis agar tooltip membaca nilai terbaru hanya saat di-hover, tanpa memaksa semua tooltip terbuka
        l.bindTooltip(
          () => {
            const v = valuesRef.current?.[f.properties.kode];
            return `<strong>${f.properties.nama}</strong><br><span>${v?.label ?? 'Data tidak tersedia'}</span>`;
          },
          { sticky: true }
        );

        l.on({
          mouseover: (e) => {
            const isCurrentSel = f.properties.kode === selectedRef.current;
            if (!isCurrentSel) {
              e.target.setStyle({
                weight: 1.6,
                color: '#288132',
                fillOpacity: 0.96
              });
            }
          },
          mouseout: (e) => {
            const isCurrentSel = f.properties.kode === selectedRef.current;
            if (!isCurrentSel) {
              e.target.setStyle(getFeatureStyle(f, selectedRef.current, valuesRef.current));
            }
          },
          click: (e) => {
            const layer = e.target;
            lastZoomedKodeRef.current = f.properties.kode;
            zoomToFeature(layer);
            onSelect?.(f.properties.kode);
            // Blur elemen target untuk mencegah browser menggambar kotak bounding box outline
            if (e?.originalEvent?.target?.blur) {
              e.originalEvent.target.blur();
            }
          }
        });
      }
    }).addTo(map);

    // Tandai class dan angkat wilayah terpilih ke layer paling atas
    layer.eachLayer((l) => {
      const isSel = l.feature?.properties?.kode === selected;
      if (l._path) {
        if (isSel) {
          l._path.classList.add('leaflet-selected-region');
        } else {
          l._path.classList.remove('leaflet-selected-region');
        }
      }
      if (isSel) {
        l.bringToFront();
      }
    });

    layerRef.current = layer;
  }, [geojson, onSelect]);

  // Update style & zoom secara presisi saat wilayah terpilih atau nilai data berubah
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!layer) return;

    layer.eachLayer((l) => {
      const f = l.feature;
      if (!f) return;
      const isSel = f.properties.kode === selected;
      l.setStyle(getFeatureStyle(f, selected, values));

      if (l._path) {
        if (isSel) {
          l._path.classList.add('leaflet-selected-region');
        } else {
          l._path.classList.remove('leaflet-selected-region');
        }
      }
      if (isSel) {
        l.bringToFront();
      }
    });

    // Handle zoom animation jika selected berubah (mis. lewat dropdown atau tombol reset)
    if (map && selected !== lastZoomedKodeRef.current) {
      lastZoomedKodeRef.current = selected;

      if (!selected || selected === 'all') {
        const fullBounds = layer.getBounds();
        if (fullBounds && fullBounds.isValid()) {
          map.flyToBounds(fullBounds, { padding: [16, 16], duration: 0.8 });
        }
      } else {
        let target = null;
        layer.eachLayer((l) => {
          if (l.feature?.properties?.kode === selected) {
            target = l;
          }
        });
        if (target) {
          zoomToFeature(target);
        }
      }
    }
  }, [selected, values]);

  return (
    <div
      style={height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
      className={`w-full ${className} rounded-2xl border-2 border-gov-border bg-gov-light overflow-hidden shadow-sm relative z-0`}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        role="img"
        aria-label="Peta persentase realisasi penyaluran pupuk bersubsidi per wilayah"
      />
    </div>
  );
}
