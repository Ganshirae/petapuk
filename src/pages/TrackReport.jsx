import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, Clock, AlertTriangle, Building2, UserCheck, RotateCcw, Check, Circle, ShieldCheck, ExternalLink, BookmarkCheck } from 'lucide-react';
import { rpc } from '../lib/supabase';
import { REPORT_CATEGORIES, REPORT_STATUS, STATUS_STEPS, OFFICIAL_CHANNELS } from '../data/ntbData';

const dt = (iso) => (iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '–');
const rp = (n) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const ACTOR = { sistem: 'Sistem', petugas: 'Petugas', pelapor: 'Pelapor' };
const ERRORS = {
  not_found: 'ID atau kode rahasia tidak cocok. Periksa kembali (huruf besar/kecil tidak berpengaruh).',
  rate_limited: 'Terlalu banyak percobaan. Tunggu 1 menit lalu coba lagi.',
  invalid_state: 'Konfirmasi hanya bisa dilakukan setelah instansi menyatakan laporan selesai.'
};

// Posisi laporan pada urutan tahap. 'dibuka_kembali' dikembalikan ke tahap tindak lanjut.
function stepIndex(status) {
  if (status === 'dibuka_kembali') return STATUS_STEPS.findIndex((s) => s.id === 'ditindaklanjuti');
  return STATUS_STEPS.findIndex((s) => s.id === status);
}

export default function TrackReport({ initialLookup, setActivePage }) {
  const [publicId, setPublicId] = useState(initialLookup?.publicId || '');
  const [secret, setSecret] = useState(initialLookup?.secretCode || '');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');

  const search = async (id = publicId, code = secret) => {
    if (!id.trim() || !code.trim()) return setError('Isi ID laporan dan kode rahasia.');
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const res = await rpc('track_report', { p_public_id: id, p_secret: code });
      if (res.error) {
        setReport(null);
        setError(ERRORS[res.error] || 'Gagal memeriksa laporan.');
      } else setReport(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLookup?.publicId && initialLookup?.secretCode) search(initialLookup.publicId, initialLookup.secretCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLookup]);

  const confirm = async (resolved) => {
    setLoading(true);
    try {
      const res = await rpc('confirm_resolution', { p_public_id: publicId, p_secret: secret, p_resolved: resolved, p_note: note || null });
      if (res.error) return setError(ERRORS[res.error] || 'Konfirmasi gagal.');
      setReport(res);
      setNote('');
      setFeedback(resolved ? 'Terima kasih. Laporan dinyatakan selesai atas konfirmasi Anda.' : 'Laporan dibuka kembali dan dikembalikan ke petugas dengan tenggat baru 14 hari kerja.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const current = report ? stepIndex(report.status) : -1;
  const lastByStatus = report ? Object.fromEntries(report.events.map((e) => [e.status, e])) : {};

  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-7">
      <header className="bg-white border border-white p-5 sm:p-8 lg:p-10 rounded-[20px] sm:rounded-[24px] space-y-2.5 sm:space-y-3 shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)]">
        <h1 className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold text-gov-dark tracking-tight leading-[1.2]">
          Sudah sampai mana laporan saya?
        </h1>
        <p className="text-sm sm:text-lg text-slate-600 max-w-4xl leading-relaxed">
          Masukkan <strong>ID laporan</strong> dan <strong>kode rahasia</strong> yang Anda peroleh saat melapor. Anda dapat memantau instansi yang menangani, batas waktu respons, dan memberikan konfirmasi penyelesaian.
        </p>
      </header>

      {/* Grid 2-Kolom: Pelacakan & Status di Kiri + Panduan SLA & Bantuan di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Kolom Kiri: Form Pencarian & Detail Hasil Lacak */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="bg-white border border-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3.5 sm:gap-4 items-end shadow-sm">
            <label className="text-sm font-bold text-gov-dark space-y-1.5 font-accent">
              <span>ID Laporan</span>
              <input value={publicId} onChange={(e) => setPublicId(e.target.value.toUpperCase())} placeholder="PP-2026-XXXXXX" autoComplete="off" className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gov-border font-accent text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft bg-white" />
            </label>
            <label className="text-sm font-bold text-gov-dark space-y-1.5 font-accent">
              <span>Kode Rahasia</span>
              <input value={secret} onChange={(e) => setSecret(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" autoComplete="off" className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gov-border font-accent text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft bg-white" />
            </label>
            <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold disabled:opacity-60 min-h-[48px] sm:min-h-[50px] transition-colors shadow-sm">
              <Search className="w-4 h-4" />{loading ? 'Memeriksa…' : 'Lacak status'}
            </button>
            {error && <p className="sm:col-span-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-3.5 sm:p-4" role="alert">{error}</p>}
            <p className="sm:col-span-3 text-xs sm:text-sm text-slate-500 pt-0.5">Lupa kode? Kode tersimpan di menu <button type="button" onClick={() => setActivePage('my-reports')} className="underline font-bold text-gov-dark hover:text-gov-emerald">Laporan Saya</button> jika Anda melapor dari peramban perangkat ini.</p>
          </form>

          {report && (
            <div className="space-y-5 sm:space-y-6">
              <section className="bg-white border-2 border-gov-dark rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 space-y-4 sm:space-y-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-accent text-sm font-bold text-slate-500">{report.public_id}</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-gov-dark mt-1">{REPORT_CATEGORIES.find((c) => c.id === report.category)?.title}</h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">{[report.desa, report.kecamatan, report.kabkota_name, report.region_name].filter(Boolean).join(', ')} • kejadian {report.incident_date}</p>
                  </div>
                  <span className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border ${report.status === 'selesai' ? 'bg-gov-light text-gov-forest border-gov-border' : report.status === 'ditolak' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-gov-light text-gov-dark border-gov-border'}`}>
                    {REPORT_STATUS[report.status]?.label}
                  </span>
                </div>

                {report.due_at && report.status !== 'selesai' && (
                  <p className={`flex items-center gap-2.5 text-sm sm:text-base p-4 rounded-xl border leading-relaxed ${report.overdue ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gov-light border-gov-border text-gov-dark'}`}>
                    {report.overdue ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Clock className="w-5 h-5 shrink-0" />}
                    <span>{report.overdue ? 'Terlambat: ' : 'Batas waktu tahap ini: '}<strong>{dt(report.due_at)}</strong>{report.status === 'selesai_instansi' && ' (menunggu konfirmasi dari Anda)'}</span>
                  </p>
                )}
                {report.assigned_agency && <p className="text-sm sm:text-base text-slate-700 flex gap-2 items-center"><Building2 className="w-5 h-5 text-gov-emerald" />Instansi yang menangani: <strong>{report.assigned_agency}</strong></p>}

                {/* Tracker tahap alur */}
                {report.status !== 'ditolak' && (
                  <ol className="space-y-0 pt-3 border-t border-gov-light">
                    {STATUS_STEPS.map((s, i) => {
                      const done = i < current || (i === current && s.id === 'selesai');
                      const active = i === current && s.id !== 'selesai';
                      const ev = lastByStatus[s.id];
                      return (
                        <li key={s.id} className="grid grid-cols-[2rem_1fr] gap-3.5">
                          <div className="flex flex-col items-center">
                            {done ? <CheckCircle2 className="w-7 h-7 text-gov-forest" /> : active ? <Clock className="w-7 h-7 text-gov-emerald" /> : <Circle className="w-7 h-7 text-slate-300" />}
                            {i < STATUS_STEPS.length - 1 && <span className={`w-0.5 flex-1 min-h-[1.75rem] ${done ? 'bg-gov-forest' : 'bg-slate-200'}`} />}
                          </div>
                          <div className="pb-6">
                            <p className={`text-base sm:text-lg font-bold ${done || active ? 'text-gov-dark' : 'text-slate-400'}`}>
                              {s.label}
                              {active && <span className="ml-2.5 text-xs font-accent font-bold text-gov-dark bg-gov-soft px-2.5 py-1 rounded-full">SEKARANG</span>}
                            </p>
                            {ev && <p className="text-xs sm:text-sm text-slate-500 mt-1">{dt(ev.created_at)}{ev.agency ? ` • ${ev.agency}` : ''}</p>}
                            {!ev && s.sla && (active || !done) && <p className="text-xs sm:text-sm text-slate-400 mt-1">{s.sla}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {(report.price_paid_per_kg && report.het_per_kg) && (
                  <p className="text-sm sm:text-base text-slate-700 p-3.5 bg-gov-light/50 rounded-xl border border-gov-light">Harga dibayar {rp(report.price_paid_per_kg)}/kg, HET resmi saat kejadian {rp(report.het_per_kg)}/kg.</p>
                )}
              </section>

              {report.status === 'selesai_instansi' && (
                <section className="bg-[#FFF5F9] border-2 border-gov-pink rounded-[24px] p-6 sm:p-8 space-y-4 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-gov-dark flex items-center gap-2.5"><UserCheck className="w-6 h-6 text-gov-pink" />Instansi menyatakan laporan selesai. Apakah masalah Anda benar-benar teratasi?</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">Laporan baru dihitung "selesai menurut pelapor" jika Anda mengonfirmasi bahwa masalah di lapangan sudah tuntas. Jika belum, Anda dapat membukanya kembali untuk tindak lanjut ulang.</p>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Catatan (opsional), mis. kios sudah menjual pupuk sesuai HET tunai" className="w-full px-4 py-3.5 rounded-xl border border-gov-border text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft bg-white" />
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button onClick={() => confirm(true)} disabled={loading} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px] shadow-sm"><Check className="w-4 h-4" />Ya, sudah teratasi</button>
                    <button onClick={() => confirm(false)} disabled={loading} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gov-dark bg-white text-gov-dark text-base font-bold hover:bg-gov-light transition-colors min-h-[48px]"><RotateCcw className="w-4 h-4" />Belum, buka kembali</button>
                  </div>
                </section>
              )}
              {feedback && <p className="text-base text-gov-forest bg-gov-light border border-gov-border rounded-xl p-4" role="status">{feedback}</p>}

              <section className="bg-white border border-white rounded-[24px] p-6 sm:p-8 space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-gov-dark">Riwayat lengkap tindak lanjut</h3>
                <ol className="space-y-4">
                  {[...report.events].reverse().map((e, i) => (
                    <li key={i} className="text-sm sm:text-base border-l-2 border-gov-border pl-4 py-1">
                      <p className="font-bold text-gov-dark">{REPORT_STATUS[e.status]?.label}</p>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{dt(e.created_at)} • {ACTOR[e.actor]}{e.agency ? ` (${e.agency})` : ''}</p>
                      {e.note && <p className="text-slate-700 mt-1.5 leading-relaxed bg-gov-light/40 p-2.5 rounded-lg">{e.note}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Panduan Kode Rahasia, SLA, & Kanal Bantuan (Sticky) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-[96px]">
          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-gov-dark flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-gov-forest" />
              Keamanan Kode Rahasia
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Kode rahasia adalah kunci unik kepemilikan laporan Anda. Server hanya menyimpan versi enkripsi sehingga petugas pun tidak bisa mengubah atau mengonfirmasi laporan atas nama Anda.
            </p>
            <button onClick={() => setActivePage('my-reports')} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gov-border text-gov-dark hover:bg-gov-light font-bold text-sm transition-colors">
              <BookmarkCheck className="w-4 h-4 text-gov-forest" /> Buka Laporan Tersimpan di HP Ini
            </button>
          </section>

          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-3.5 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-gov-dark flex items-center gap-2">
              <Clock className="w-5 h-5 text-gov-emerald" />
              Standar Batas Waktu (SLA)
            </h3>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2">
              <li className="p-2.5 bg-gov-light/60 rounded-xl border border-gov-border">
                <strong>Verifikasi Awal:</strong> 3 hari kerja sejak pengiriman.
              </li>
              <li className="p-2.5 bg-gov-light/60 rounded-xl border border-gov-border">
                <strong>Investigasi Lapangan:</strong> Maksimal 14 hari kerja.
              </li>
              <li className="p-2.5 bg-gov-soft/70 rounded-xl border border-gov-border">
                <strong>Konfirmasi Pelapor:</strong> Laporan tidak dihitung selesai tanpa persetujuan Anda.
              </li>
            </ul>
          </section>

          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-3 shadow-sm">
            <h3 className="text-base font-bold text-gov-dark">Kanal Resmi Pemerintah</h3>
            <p className="text-xs sm:text-sm text-slate-600">Jika penanganan terlambat, Anda dapat langsung menghubungi:</p>
            <ul className="space-y-2">
              {OFFICIAL_CHANNELS.slice(0, 2).map((c) => (
                <li key={c.name}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-2 p-2.5 border border-gov-light rounded-xl hover:border-gov-border text-xs sm:text-sm transition-colors">
                    <span><strong className="block text-gov-dark">{c.name}</strong><span className="text-slate-500 text-xs">{c.detail}</span></span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
