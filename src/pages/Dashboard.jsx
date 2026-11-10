import React, { useEffect, useMemo, useState } from 'react';
import { Download, Send, Search, Calculator, ExternalLink, AlertTriangle, Info, CheckCircle2, Clock, MapPin } from 'lucide-react';
import ChoroplethMap, { PCT_CLASSES } from '../components/ChoroplethMap';
import { TrendChart, PctBars } from '../components/Charts';
import SourceBadge from '../components/SourceBadge';
import { NTB_GEOJSON } from '../data/ntbGeoJSON';
import { OFFICIAL_CHANNELS, REPORT_STATUS, REPORT_CATEGORIES } from '../data/ntbData';
import { rpc } from '../lib/supabase';

const ton = (n) => (n === null || n === undefined ? '–' : `${Math.round(n).toLocaleString('id-ID')} t`);
const rp = (n) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const pctOf = (a, r) => (a > 0 && r !== null ? (r / a) * 100 : null);

function sum(rows) {
  const a = rows.reduce((s, r) => s + (r.allocation_ton || 0), 0);
  const r = rows.reduce((s, x) => s + (x.realization_ton || 0), 0);
  return { allocation: rows.length ? a : null, realization: rows.length ? r : null, pct: pctOf(a, r) };
}

export default function Dashboard({ data, setActivePage, setPrefilledReportData }) {
  const { regions, fertilizers, het, stats, sources } = data;
  const [scope, setScope] = useState('nasional'); // 'nasional' | '52'
  const [selected, setSelected] = useState('all');
  const [geoNasional, setGeoNasional] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [publicReports, setPublicReports] = useState([]);

  const isNtb = scope === '52';
  // Nasional: 5 berkas Kementan (satu per jenis pupuk, id 'kementan_<pupuk>_prov'). NTB: satu berkas kab/kota.
  const inScope = (sid) => (isNtb ? sid === 'ntb_kabkota' : sid.startsWith('kementan_'));
  const scopeStats = useMemo(() => stats.filter((s) => inScope(s.source_id)), [stats, isNtb]); // eslint-disable-line react-hooks/exhaustive-deps
  const years = useMemo(() => [...new Set(scopeStats.map((s) => s.year))].sort(), [scopeStats]);
  const fertOptions = useMemo(() => fertilizers.filter((f) => scopeStats.some((s) => s.fertilizer_id === f.id)), [fertilizers, scopeStats]);
  const [year, setYear] = useState(null);
  const [fert, setFert] = useState('all');
  const activeYear = years.includes(year) ? year : years[years.length - 1];
  const activeFert = fert;
  const fertName = activeFert === 'all' ? 'semua jenis' : fertOptions.find((f) => f.id === activeFert)?.name;

  const regionName = useMemo(() => Object.fromEntries(regions.map((r) => [r.code, r.name])), [regions]);
  const source = sources[isNtb ? 'ntb_kabkota' : `kementan_${activeFert === 'all' ? 'urea' : activeFert}_prov`];
  // Jenis pupuk yang punya data pada tahun terpilih (mis. SP-36 hanya s.d. 2022)
  const fertsInYear = useMemo(() => fertOptions.filter((f) => scopeStats.some((s) => s.year === activeYear && s.fertilizer_id === f.id)), [fertOptions, scopeStats, activeYear]);

  useEffect(() => {
    fetch('/geo/provinsi.json').then((r) => r.json()).then(setGeoNasional).catch(() => setGeoNasional(null));
  }, []);

  useEffect(() => {
    const region = isNtb ? '52' : null;
    rpc('report_stats', { p_region_code: region }).then(setReportStats).catch(() => setReportStats(null));
    rpc('public_reports', { p_region_code: region, p_limit: 8 }).then(setPublicReports).catch(() => setPublicReports([]));
  }, [isNtb]);

  const filtered = useMemo(
    () => scopeStats.filter((s) => s.year === activeYear && (activeFert === 'all' || s.fertilizer_id === activeFert)),
    [scopeStats, activeYear, activeFert]
  );

  // Agregat per wilayah untuk peta, tabel, dan peringkat
  const byRegion = useMemo(() => {
    const groups = {};
    for (const s of filtered) (groups[s.region_code] ||= []).push(s);
    return Object.entries(groups)
      .map(([code, rows]) => ({ code, name: regionName[code] || code, ...sum(rows) }))
      .sort((a, b) => (b.allocation || 0) - (a.allocation || 0));
  }, [filtered, regionName]);

  const provOptions = useMemo(() => {
    return regions
      .filter((r) => r.level === 'provinsi')
      .sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [regions]);

  const kabOptions = useMemo(() => {
    return regions
      .filter((r) => r.level === 'kabkota')
      .sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [regions]);

  const total = useMemo(() => sum(filtered), [filtered]);

  const trend = useMemo(
    () =>
      years.map((y) => {
        const rows = scopeStats.filter((s) => s.year === y && (activeFert === 'all' || s.fertilizer_id === activeFert));
        const t = sum(rows);
        return { year: y, allocation: t.allocation, realization: t.realization };
      }),
    [years, scopeStats, activeFert]
  );

  const byFert = useMemo(() => {
    return fertOptions
      .map((f) => {
        const rows = scopeStats.filter((s) => s.year === activeYear && s.fertilizer_id === f.id);
        const t = sum(rows);
        return { key: f.id, label: f.name, pct: rows.length ? t.pct : null, sub: `${ton(t.realization)} dari ${ton(t.allocation)}` };
      })
      .filter((r) => r.pct !== null);
  }, [fertOptions, scopeStats, activeYear]);

  const mapValues = useMemo(
    () => Object.fromEntries(byRegion.map((r) => [r.code, { pct: r.pct, label: `${r.pct?.toFixed(1) ?? '–'}% • ${ton(r.realization)} dari ${ton(r.allocation)}` }])),
    [byRegion]
  );

  const sel = byRegion.find((r) => r.code === selected);

  // Filter pupuk dipertahankan bila jenis itu ada di cakupan baru
  const switchScope = (s) => {
    setScope(s);
    setSelected(s === '52' ? '5201' : 'all');
    const target = stats.filter((x) => (s === '52' ? x.source_id === 'ntb_kabkota' : x.source_id.startsWith('kementan_')));
    if (!target.some((x) => x.fertilizer_id === fert)) setFert('all');
  };

  const handleRegionChange = (val) => {
    if (!val || val === 'all') {
      if (scope !== 'nasional') {
        switchScope('nasional');
      }
      setSelected('all');
      return;
    }

    const isKab = String(val).length === 4;
    if (isKab) {
      if (scope !== '52') {
        switchScope('52');
      }
      setSelected(val);
    } else {
      if (scope !== 'nasional') {
        switchScope('nasional');
      }
      setSelected(val);
    }
  };

  const handleSelect = (code) => {
    handleRegionChange(code);
  };

  const handleCSV = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['kode_wilayah', 'nama_wilayah', 'jenis_pupuk', 'tahun', 'alokasi_ton', 'realisasi_ton', 'persen_realisasi', 'sumber', 'url_sumber'];
    const rows = scopeStats.map((s) =>
      [s.region_code, regionName[s.region_code], s.fertilizer_id, s.year, s.allocation_ton, s.realization_ton, s.realization_pct, sources[s.source_id]?.publisher, sources[s.source_id]?.url].map(esc).join(',')
    );
    const blob = new Blob(['\ufeff' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pepuk_${isNtb ? 'ntb_kabkota' : 'nasional_provinsi'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const lapor = (prefill = {}) => {
    setPrefilledReportData?.({ regionCode: isNtb ? selected : selected || '', ...prefill });
    setActivePage('report');
  };

  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-7">
      {/* Header + aksi utama */}
      <section className="bg-white rounded-[20px] sm:rounded-[24px] border border-white p-5 sm:p-8 lg:p-10 shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-4xl">
            <h1 className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold text-gov-dark tracking-tight leading-[1.2]">
              Berapa jatah pupuk subsidi, berapa yang sampai, dan berapa harga resminya?
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Data resmi Kementerian Pertanian (38 provinsi) dan Satu Data NTB (10 kabupaten/kota). Lapor tanpa akun dan tanpa NIK.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button onClick={() => lapor()} className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-sm sm:text-base font-bold min-h-[46px] sm:min-h-[48px] transition-colors shadow-sm">
              <Send className="w-4 h-4" /> Buat laporan
            </button>
            <button onClick={() => setActivePage('track')} className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white border border-gov-border hover:bg-gov-light text-gov-dark text-sm sm:text-base font-bold min-h-[46px] sm:min-h-[48px] transition-colors">
              <Search className="w-4 h-4" /> Cek laporan
            </button>
          </div>
        </div>
      </section>

      {!isNtb && (
        <p className="flex items-start gap-2 text-sm text-gov-dark/80 bg-gov-soft/60 border border-gov-border rounded-[16px] px-4 py-3">
          <Info className="w-4 h-4 text-gov-emerald shrink-0 mt-px" />
          <span>
            Data nasional per provinsi dari Satu Data Kementan. {activeYear === 2025 && 'Data 2025 hanya sampai Oktober 2025, sehingga realisasinya belum penuh setahun. '}
            {activeYear === 2022 && 'Realisasi ZA, Organik, dan SP-36 tahun 2022 hanya sampai September 2022. '}
            Jenis pupuk tahun {activeYear}: {fertsInYear.map((f) => f.name).join(', ') || '–'}. Pilih NTB di peta untuk membuka detail kab/kota.
          </span>
        </p>
      )}

      {/* KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: `Alokasi ${activeYear}`, value: ton(total.allocation), sub: `${isNtb ? 'NTB' : 'Indonesia'}, ${fertName}` },
          { label: 'Realisasi Tersalurkan', value: ton(total.realization), sub: 'tersalurkan ke petani' },
          { label: '% Capaian Realisasi', value: total.pct === null ? '–' : `${total.pct.toFixed(1)}%`, sub: 'realisasi ÷ alokasi' },
          { label: 'Laporan Warga', value: reportStats ? reportStats.total : '–', sub: reportStats ? `${reportStats.selesai_menurut_pelapor} selesai menurut pelapor` : 'memuat…' }
        ].map((k, i) => (
          <div key={k.label} className={`rounded-[24px] p-6 sm:p-7 border transition-all ${i === 2 ? 'bg-gov-dark border-gov-dark text-white shadow-md' : 'bg-white border-gov-light hover:border-gov-border shadow-sm'}`}>
            <p className={`font-accent text-xs sm:text-sm font-semibold uppercase tracking-wider ${i === 2 ? 'text-gov-soft' : 'text-slate-500'}`}>{k.label}</p>
            <p className={`font-accent text-3xl sm:text-4xl font-bold tabular-nums mt-2.5 ${i === 2 ? 'text-gov-bright' : 'text-gov-dark'}`}>{k.value}</p>
            <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${i === 2 ? 'text-white/80' : 'text-slate-500'}`}>{k.sub}</p>
          </div>
        ))}
      </section>

      {/* Filter wilayah, tahun, dan pupuk (ditempatkan tepat di atas peta tanpa sticky) */}
      <section className="bg-white rounded-[20px] border border-gov-light p-3.5 sm:px-5 sm:py-4 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 text-sm">
        {/* Kluster Kiri: Filter Wilayah, Tahun, dan Pupuk */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 w-full xl:w-auto">
          {/* Dropdown Pemilihan Wilayah / Provinsi / Kab-Kota */}
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="font-accent font-semibold text-gov-dark/80 text-xs sm:text-sm">Wilayah</span>
            <select
              value={selected}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gov-border bg-white text-xs sm:text-sm font-medium text-gov-dark min-w-[190px] max-w-[240px] sm:max-w-[280px] truncate"
            >
              <option value="all">Seluruh Indonesia (Semua Provinsi)</option>
              <optgroup label="38 Provinsi di Indonesia">
                {provOptions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kabupaten / Kota (Data Terbuka NTB)">
                {kabOptions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          {/* Dropdown Tahun */}
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="font-accent font-semibold text-gov-dark/80 text-xs sm:text-sm">Tahun</span>
            <select
              value={activeYear ?? ''}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gov-border bg-white font-accent text-xs sm:text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          {/* Dropdown Jenis Pupuk */}
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="font-accent font-semibold text-gov-dark/80 text-xs sm:text-sm">Pupuk</span>
            <select
              value={activeFert}
              onChange={(e) => setFert(e.target.value)}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gov-border bg-white text-xs sm:text-sm max-w-[150px] sm:max-w-[180px] truncate"
            >
              <option value="all">Semua jenis</option>
              {fertOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                  {fertsInYear.some((x) => x.id === f.id) ? '' : ` (tidak ada data ${activeYear})`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Kluster Kanan: Badge Sumber Data Resmi (Ringkas & Proporsional) + Tombol Unduh CSV */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2.5 xl:pt-0 border-t xl:border-t-0 border-gov-light shrink-0">
          <SourceBadge source={source} compact={true} />
          <button
            onClick={handleCSV}
            title="Unduh data tabel dalam format CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-gov-border hover:bg-gov-light font-bold text-xs sm:text-sm text-gov-dark shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gov-emerald" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </section>

      {/* Peta + detail wilayah */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start lg:items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[20px] sm:rounded-[24px] border border-white p-4 sm:p-7 space-y-4 lg:space-y-0 flex flex-col lg:justify-between shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-xl font-bold text-gov-dark">
              <MapPin className="w-5 h-5 text-gov-emerald" />
              Peta % realisasi {isNtb ? 'per kabupaten/kota NTB' : 'per provinsi'}
            </h2>
            {isNtb ? (
              <button
                onClick={() => handleRegionChange('all')}
                className="text-xs sm:text-sm font-bold text-gov-emerald hover:text-gov-dark hover:underline flex items-center gap-1"
              >
                ← Kembali ke peta nasional
              </button>
            ) : selected !== 'all' ? (
              <button
                onClick={() => handleRegionChange('all')}
                className="text-xs sm:text-sm font-bold text-gov-emerald hover:text-gov-dark hover:underline flex items-center gap-1"
              >
                ↺ Reset zoom seluruh Indonesia
              </button>
            ) : null}
          </div>
          <ChoroplethMap geojson={isNtb ? NTB_GEOJSON : geoNasional} values={mapValues} selected={selected} onSelect={handleSelect} className="h-[320px] sm:h-[380px] lg:h-[460px]" />
          <ul className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm font-accent text-slate-600 pt-1" aria-label="Legenda">
            {PCT_CLASSES.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-1.5 sm:gap-2"><span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md border border-slate-300 inline-block shrink-0" style={{ background: c.color }} />{c.label}</li>
            ))}
            <li className="inline-flex items-center gap-1.5 sm:gap-2"><span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-slate-200 inline-block shrink-0" />tidak ada data</li>
          </ul>
        </div>

        <aside className="lg:col-span-5 xl:col-span-4 relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-gov-dark via-gov-forest to-gov-emerald p-5 sm:p-7 lg:p-8 text-white flex flex-col justify-between shadow-md">
          <span className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full border-[28px] border-white/10" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full border-[24px] border-gov-bright/20" aria-hidden="true" />
          {sel ? (
            <div className="relative space-y-4 sm:space-y-6">
              <div>
                <p className="font-accent text-xs font-semibold uppercase tracking-[0.14em] text-gov-soft">Ringkasan Data Wilayah</p>
                <h3 className="mt-1 text-xl sm:text-3xl font-bold leading-tight tracking-tight">{sel.name}</h3>
                <p className="font-accent text-xs sm:text-sm text-white/70 mt-1">KODE {sel.code} • TAHUN {activeYear}</p>
              </div>
              <div className="py-1">
                <p className="font-accent text-5xl sm:text-7xl font-bold leading-none text-gov-bright">{sel.pct?.toFixed(1) ?? '–'}%</p>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-white/90 font-medium">Pupuk sudah sampai ke petani</p>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-gov-soft p-3 sm:p-3.5 text-gov-dark shadow-sm">
                  <dt className="font-accent font-semibold leading-tight text-[11px] sm:text-xs">Jatah daerah ini</dt>
                  <dd className="font-accent text-base sm:text-xl font-bold leading-tight mt-1">{ton(sel.allocation)}</dd>
                </div>
                <div className="rounded-xl bg-gov-soft p-3 sm:p-3.5 text-gov-dark shadow-sm">
                  <dt className="font-accent font-semibold leading-tight text-[11px] sm:text-xs">Sudah disalurkan</dt>
                  <dd className="font-accent text-base sm:text-xl font-bold leading-tight mt-1">{ton(sel.realization)}</dd>
                </div>
                <div className="rounded-xl bg-gov-pink p-3 sm:p-3.5 text-gov-dark shadow-sm">
                  <dt className="font-accent font-semibold leading-tight text-[11px] sm:text-xs">Belum disalurkan</dt>
                  <dd className="font-accent text-base sm:text-xl font-bold leading-tight mt-1">{ton(Math.max((sel.allocation || 0) - (sel.realization || 0), 0))}</dd>
                </div>
              </dl>
              {sel.pct > 100 && (
                <p className="text-xs sm:text-sm text-white/90 flex gap-2 items-center bg-white/10 p-2.5 rounded-lg border border-white/20"><AlertTriangle className="w-4 h-4 shrink-0 text-gov-bright" />Realisasi melebihi alokasi pada data sumber (tercatat apa adanya).</p>
              )}
              <div className="space-y-2.5 pt-2">
                {!isNtb && sel.code === '52' && (
                  <button onClick={() => handleRegionChange('5201')} className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/15 text-white text-sm font-bold hover:bg-white/25 transition-colors min-h-[44px]">Lihat detail 10 kab/kota NTB →</button>
                )}
                <button onClick={() => lapor()} className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-xl bg-gov-bright text-gov-dark text-sm sm:text-base font-bold hover:bg-gov-soft transition-colors shadow-sm min-h-[46px] sm:min-h-[48px]">
                  <Send className="w-4 h-4" /> Laporkan masalah di {sel.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative space-y-4 sm:space-y-6">
              <div>
                <p className="font-accent text-xs font-semibold uppercase tracking-[0.14em] text-gov-soft">Ringkasan Data</p>
                <h3 className="mt-1 text-xl sm:text-3xl font-bold leading-tight tracking-tight">{isNtb ? 'Nusa Tenggara Barat' : 'Seluruh Indonesia'}</h3>
                <p className="font-accent text-xs sm:text-sm text-white/70 mt-1">{isNtb ? '10 KAB/KOTA' : '38 PROVINSI'} • TAHUN {activeYear}</p>
              </div>
              <div className="py-1">
                <p className="font-accent text-5xl sm:text-7xl font-bold leading-none text-gov-bright">{total.pct?.toFixed(1) ?? '–'}%</p>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-white/90 font-medium">Realisasi pupuk subsidi {isNtb ? 'NTB' : 'nasional'}</p>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-gov-soft p-3 sm:p-3.5 text-gov-dark shadow-sm">
                  <dt className="font-accent font-semibold leading-tight text-[11px] sm:text-xs">Total Alokasi</dt>
                  <dd className="font-accent text-base sm:text-xl font-bold leading-tight mt-1">{ton(total.allocation)}</dd>
                </div>
                <div className="rounded-xl bg-gov-soft p-3 sm:p-3.5 text-gov-dark shadow-sm">
                  <dt className="font-accent font-semibold leading-tight text-[11px] sm:text-xs">Sudah Disalurkan</dt>
                  <dd className="font-accent text-base sm:text-xl font-bold leading-tight mt-1">{ton(total.realization)}</dd>
                </div>
                <div className="rounded-xl bg-gov-pink p-3 sm:p-3.5 text-gov-dark shadow-sm">
                  <dt className="font-accent font-semibold leading-tight text-[11px] sm:text-xs">Belum Disalurkan</dt>
                  <dd className="font-accent text-base sm:text-xl font-bold leading-tight mt-1">{ton(Math.max((total.allocation || 0) - (total.realization || 0), 0))}</dd>
                </div>
              </dl>
              <div className="space-y-2.5 pt-2">
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Pilih wilayah pada dropdown atau klik langsung daerah di peta untuk memperbesar (zoom) dan melihat data spesifik wilayah.
                </p>
                <button onClick={() => lapor()} className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-xl bg-gov-bright text-gov-dark text-sm sm:text-base font-bold hover:bg-gov-soft transition-colors shadow-sm min-h-[46px] sm:min-h-[48px]">
                  <Send className="w-4 h-4" /> Laporkan masalah pupuk
                </button>
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Grafik */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-3.5 shadow-sm">
          <h2 className="text-lg font-bold text-gov-dark">Tren {years[0]}–{years[years.length - 1]} {isNtb ? 'NTB' : 'nasional'}, {fertName}</h2>
          <TrendChart rows={trend} />
          {activeFert === 'all' && <p className="text-xs sm:text-sm text-slate-500">Jenis pupuk yang tercatat berbeda tiap tahun; pilih satu jenis untuk perbandingan antartahun yang setara.</p>}
        </div>
        <div className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-3.5 shadow-sm">
          <h2 className="text-lg font-bold text-gov-dark">% realisasi per jenis pupuk, {activeYear}</h2>
          <PctBars rows={byFert} onSelect={(id) => setFert(id === activeFert ? 'all' : id)} selected={activeFert} />
          <p className="text-xs sm:text-sm text-slate-500">Klik untuk memfilter seluruh dashboard.</p>
        </div>
        <div className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-3.5 shadow-sm">
          <h2 className="text-lg font-bold text-gov-dark">Peringkat {isNtb ? 'kab/kota' : 'provinsi'}, {activeYear}</h2>
          <div className="max-h-[320px] overflow-y-auto pr-1">
            <PctBars
              rows={[...byRegion].filter((r) => r.pct !== null).sort((a, b) => a.pct - b.pct).map((r) => ({ key: r.code, label: r.name, pct: r.pct, sub: `${ton(r.realization)} dari ${ton(r.allocation)}` }))}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Diurutkan dari realisasi terendah.</p>
        </div>
      </section>

      {/* Tabel wilayah */}
      <section className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-gov-dark">Tabel per {isNtb ? 'kabupaten/kota' : 'provinsi'}, {activeYear}</h2>
        <div className="overflow-x-auto max-h-[440px] overflow-y-auto rounded-xl border border-gov-light">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gov-light text-gov-dark font-accent text-xs uppercase">
              <tr><th className="text-left p-3.5">Wilayah</th><th className="text-right p-3.5">Alokasi</th><th className="text-right p-3.5">Realisasi</th><th className="text-right p-3.5">%</th><th className="p-3.5"><span className="sr-only">Aksi</span></th></tr>
            </thead>
            <tbody className="divide-y divide-gov-light">
              {byRegion.map((r) => (
                <tr key={r.code} className={selected === r.code ? 'bg-gov-soft/50' : 'hover:bg-gov-light/50'}>
                  <td className="p-3.5 font-medium text-gov-dark">{r.name}</td>
                  <td className="p-3.5 text-right font-accent tabular-nums">{ton(r.allocation)}</td>
                  <td className="p-3.5 text-right font-accent tabular-nums">{ton(r.realization)}</td>
                  <td className="p-3.5 text-right font-accent font-bold tabular-nums">{r.pct?.toFixed(1) ?? '–'}%</td>
                  <td className="p-3.5 text-right"><button onClick={() => handleSelect(r.code)} className="text-gov-emerald font-bold hover:text-gov-dark hover:underline">Pilih</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HET + kalkulator */}
      <HetPanel het={het} fertilizers={fertilizers} source={sources.kepmentan_1117_2025} onReport={(p) => lapor(p)} />

      {/* Laporan publik + kanal resmi */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-gov-dark">Tindak lanjut laporan warga {isNtb ? 'NTB' : 'nasional'}</h2>
          {reportStats && (
            <dl className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-3.5 bg-gov-light border border-gov-border rounded-xl"><dt className="text-gov-dark/70 font-accent">Dalam proses</dt><dd className="font-accent font-bold text-xl text-gov-dark mt-1">{reportStats.dalam_proses + reportStats.menunggu_verifikasi}</dd></div>
              <div className="p-3.5 bg-gov-light border border-gov-border rounded-xl"><dt className="text-gov-dark/70 font-accent">Selesai menurut instansi</dt><dd className="font-accent font-bold text-xl text-gov-dark mt-1">{reportStats.selesai_menurut_instansi}</dd></div>
              <div className="p-3.5 bg-gov-soft border border-gov-border rounded-xl"><dt className="text-gov-dark/80 font-accent">Selesai menurut pelapor</dt><dd className="font-accent font-bold text-xl text-gov-dark mt-1">{reportStats.selesai_menurut_pelapor}</dd></div>
            </dl>
          )}
          {reportStats?.terlambat > 0 && <p className="text-sm text-red-700 flex gap-2 items-center"><Clock className="w-4 h-4" />{reportStats.terlambat} laporan melewati batas waktu respons.</p>}
          {publicReports.length ? (
            <ul className="divide-y divide-gov-light text-sm">
              {publicReports.map((r) => (
                <li key={r.public_id} className="py-3 flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-accent font-bold text-gov-dark">{r.public_id}</p>
                    <p className="text-slate-600 truncate mt-0.5">{REPORT_CATEGORIES.find((c) => c.id === r.category)?.title} • {r.region_name}{r.kiosk_name ? ` • ${r.kiosk_name}` : ''}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-bold ${r.overdue ? 'text-red-700' : 'text-slate-700'}`}>{r.overdue ? 'Terlambat • ' : ''}{REPORT_STATUS[r.status]?.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-gov-emerald" />Belum ada laporan terverifikasi yang ditampilkan publik. Laporan baru tampil setelah diverifikasi petugas.</p>
          )}
        </div>
        <div className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gov-dark">Kanal resmi pemerintah</h2>
            <p className="text-sm text-slate-600">PetaPuk melengkapi, tidak menggantikan kanal resmi. Anda juga dapat melapor langsung ke:</p>
            <ul className="space-y-3">
              {OFFICIAL_CHANNELS.map((c) => (
                <li key={c.name}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 p-3.5 border border-gov-light rounded-xl hover:border-gov-border hover:bg-gov-light/40 text-sm transition-colors">
                    <span><strong className="text-gov-dark block font-semibold">{c.name}</strong><span className="text-slate-600 text-xs mt-0.5 block">{c.detail}</span></span>
                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => setActivePage('eligibility')} className="w-full px-5 py-3.5 rounded-xl bg-gov-forest text-white text-base font-bold hover:bg-gov-hover transition-colors shadow-sm mt-2">Cek apakah saya berhak pupuk subsidi →</button>
        </div>
      </section>
    </div>
  );
}

function HetPanel({ het, fertilizers, source, onReport }) {
  const [fid, setFid] = useState(het[0]?.fertilizer_id);
  const [kg, setKg] = useState('50');
  const [paid, setPaid] = useState('');
  const h = het.find((x) => x.fertilizer_id === fid);
  const name = (id) => fertilizers.find((f) => f.id === id)?.name ?? id;
  const qty = Number(kg) || 0;
  const paidNum = Number(paid) || 0;
  const legal = h ? h.price_per_kg * qty : 0;
  const diff = paidNum - legal;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      <div className="bg-white rounded-[24px] border border-white p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gov-dark">Harga Eceran Tertinggi (HET) berlaku</h2>
          <SourceBadge source={source} />
        </div>
        <div className="overflow-x-auto rounded-xl border border-gov-light">
          <table className="w-full text-sm">
            <thead className="bg-gov-light font-accent text-xs uppercase text-gov-dark"><tr><th className="text-left p-3.5">Pupuk</th><th className="text-right p-3.5">Per kg</th><th className="text-right p-3.5">Per sak</th></tr></thead>
            <tbody className="divide-y divide-gov-light">
              {het.map((x) => (
                <tr key={x.fertilizer_id}><td className="p-3.5 font-medium text-gov-dark">{name(x.fertilizer_id)}</td><td className="p-3.5 text-right font-accent">{rp(x.price_per_kg)}</td><td className="p-3.5 text-right font-accent">{x.pack_kg ? `${rp(x.price_per_kg * x.pack_kg)} / ${x.pack_kg} kg` : '–'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {het[0] && <p className="text-xs sm:text-sm text-slate-500">{het[0].regulation}, berlaku sejak {het[0].effective_from}. Harga di tingkat pengecer resmi (kios), dibayar tunai.</p>}
      </div>

      <div className="bg-gov-soft rounded-[24px] border border-gov-border p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gov-dark flex items-center gap-2"><Calculator className="w-5 h-5 text-gov-forest" />Kalkulator: apakah saya membayar terlalu mahal?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <label className="space-y-1.5"><span className="font-accent font-semibold text-gov-dark">Jenis pupuk</span>
              <select value={fid} onChange={(e) => setFid(e.target.value)} className="w-full px-3.5 py-3 rounded-xl border border-gov-dark/20 bg-white text-base">
                {het.map((x) => <option key={x.fertilizer_id} value={x.fertilizer_id}>{name(x.fertilizer_id)}</option>)}
              </select>
            </label>
            <label className="space-y-1.5"><span className="font-accent font-semibold text-gov-dark">Jumlah (kg)</span>
              <input type="number" inputMode="decimal" min="1" value={kg} onChange={(e) => setKg(e.target.value)} className="w-full px-3.5 py-3 rounded-xl border border-gov-dark/20 bg-white font-accent text-base" />
            </label>
            <label className="space-y-1.5"><span className="font-accent font-semibold text-gov-dark">Total dibayar (Rp)</span>
              <input type="number" inputMode="numeric" min="0" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="mis. 120000" className="w-full px-3.5 py-3 rounded-xl border border-gov-dark/20 bg-white font-accent text-base" />
            </label>
          </div>
          <div className="text-sm p-4 rounded-xl bg-white/80 border border-gov-dark/10 space-y-1.5 text-gov-dark" aria-live="polite">
            <p>Harga resmi untuk {qty.toLocaleString('id-ID')} kg: <strong className="font-accent">{rp(legal)}</strong></p>
            {paidNum > 0 && (diff > 0 ? (
              <p className="text-red-700 font-bold">Anda membayar {rp(diff)} lebih mahal dari HET ({rp(paidNum / qty)}/kg).</p>
            ) : (
              <p className="text-gov-forest font-bold">Harga yang Anda bayar sesuai HET.</p>
            ))}
          </div>
        </div>
        {paidNum > 0 && diff > 0 && (
          <button onClick={() => onReport({ category: 'harga_di_atas_het', fertilizerId: fid, quantityKg: qty, pricePaidPerKg: Math.round(paidNum / qty) })}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gov-dark hover:bg-gov-forest text-white text-base font-bold transition-colors shadow-sm">
            <Send className="w-4 h-4" /> Laporkan harga di atas HET
          </button>
        )}
      </div>
    </section>
  );
}
