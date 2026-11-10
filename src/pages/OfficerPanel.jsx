import React, { useCallback, useEffect, useState } from 'react';
import { LogIn, LogOut, RefreshCw, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { supabase, rpc } from '../lib/supabase';
import { REPORT_CATEGORIES, REPORT_STATUS } from '../data/ntbData';

const dt = (iso) => (iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '–');
// Transisi yang diizinkan untuk petugas (konfirmasi akhir tetap milik pelapor)
const NEXT = {
  diterima: ['diverifikasi', 'ditolak'],
  diverifikasi: ['diteruskan', 'ditindaklanjuti', 'ditolak'],
  diteruskan: ['ditindaklanjuti', 'selesai_instansi'],
  ditindaklanjuti: ['selesai_instansi'],
  dibuka_kembali: ['ditindaklanjuti', 'selesai_instansi'],
  selesai_instansi: [],
  selesai: [],
  ditolak: []
};

export default function OfficerPanel() {
  const [session, setSession] = useState(null);
  const [officer, setOfficer] = useState(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setOfficer(undefined);
    supabase.from('officers').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => setOfficer(data));
  }, [session]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError('Email atau kata sandi salah.');
  };

  if (!session) {
    return (
      <div className="rounded-[28px] bg-gov-pale p-6 sm:p-12 max-w-lg mx-auto my-8">
        <form onSubmit={login} className="bg-white border-2 border-gov-dark rounded-[24px] p-6 sm:p-8 space-y-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gov-dark">Masuk Petugas</h1>
          <p className="text-sm text-slate-600">Khusus verifikator instansi pemerintah. Akun dibuat oleh admin sistem.</p>
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Resmi</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@instansi.go.id" autoComplete="username" className="w-full px-4 py-3 rounded-xl border border-gov-border text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kata Sandi</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="w-full px-4 py-3 rounded-xl border border-gov-border text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
            </div>
          </div>
          {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200" role="alert">{error}</p>}
          <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px]"><LogIn className="w-5 h-5" />Masuk ke Panel</button>
        </form>
      </div>
    );
  }

  if (officer === undefined) return <p className="text-center text-base text-slate-500 py-12">Memuat data petugas…</p>;
  if (officer === null) {
    return (
      <div className="rounded-[28px] bg-gov-pale p-6 sm:p-12 max-w-lg mx-auto my-8">
        <div className="bg-white border-2 border-red-200 rounded-[24px] p-6 sm:p-8 space-y-4 shadow-sm text-center">
          <p className="text-base text-slate-700">Akun <strong>{session.user.email}</strong> belum terdaftar sebagai verifikator petugas resmi.</p>
          <button onClick={() => supabase.auth.signOut()} className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-50 text-sm">Keluar</button>
        </div>
      </div>
    );
  }

  return <Queue officer={officer} />;
}

function Queue({ officer }) {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('aktif');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('reports')
      .select('id,public_id,category,fertilizer_id,region_code,kabkota_name,kecamatan,desa,kiosk_name,incident_date,quantity_kg,price_paid_per_kg,het_per_kg,description,contact,photo_paths,needs_field_check,status,assigned_agency,due_at,created_at,updated_at,regions(name)')
      .order('due_at', { ascending: true, nullsFirst: false })
      .limit(200);
    if (filter === 'aktif') q = q.not('status', 'in', '(selesai,ditolak)');
    const { data } = await q;
    setReports(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const now = Date.now();
  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-6">
      <header className="bg-white border border-white p-4 sm:p-7 rounded-[20px] sm:rounded-[24px] shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-dark tracking-tight">Antrian Laporan Masuk</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">{officer.name} • <span className="text-gov-forest font-bold">{officer.agency}</span></p>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3.5 py-2 rounded-xl border border-gov-border text-sm font-semibold bg-white">
            <option value="aktif">Belum Selesai</option>
            <option value="semua">Semua Laporan</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gov-border bg-white text-gov-dark hover:bg-gov-light text-sm font-bold min-h-[40px]"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Muat Ulang</button>
          <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-bold min-h-[40px]"><LogOut className="w-4 h-4" />Keluar</button>
        </div>
      </header>

      {reports.length === 0 && <p className="text-base text-slate-500 text-center py-12 bg-white rounded-2xl border border-gov-light">Tidak ada laporan dalam daftar ini.</p>}
      <ul className="space-y-3">
        {reports.map((r) => {
          const overdue = r.due_at && new Date(r.due_at).getTime() < now && !['selesai', 'ditolak'].includes(r.status);
          return (
            <li key={r.id} className={`bg-white border-2 rounded-[20px] shadow-sm transition-all ${overdue ? 'border-red-400 bg-red-50/20' : 'border-gov-light hover:border-gov-border'}`}>
              <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="w-full text-left p-5 grid sm:grid-cols-[1fr_auto] gap-3 rounded-[20px]">
                <div className="space-y-1">
                  <p className="font-accent font-bold text-base sm:text-lg text-gov-dark">{r.public_id}</p>
                  <p className="text-sm text-slate-600">{REPORT_CATEGORIES.find((c) => c.id === r.category)?.title} • {[r.kabkota_name, r.regions?.name].filter(Boolean).join(', ')}</p>
                </div>
                <div className="text-sm sm:text-right space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gov-light text-gov-dark border border-gov-border">
                    {REPORT_STATUS[r.status]?.label || r.status}
                  </span>
                  <p className={overdue ? 'text-red-700 font-bold text-xs' : 'text-slate-500 text-xs'}>{overdue && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}Tenggat {dt(r.due_at)}</p>
                </div>
              </button>
              {openId === r.id && <Detail report={r} onDone={load} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Detail({ report: r, onDone }) {
  const [status, setStatus] = useState(NEXT[r.status][0] || '');
  const [note, setNote] = useState('');
  const [agency, setAgency] = useState(r.assigned_agency || '');
  const [field, setField] = useState(r.needs_field_check);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!r.photo_paths.length) return;
    supabase.storage.from('report-evidence').createSignedUrls(r.photo_paths, 600).then(({ data }) => setPhotoUrls((data || []).map((d) => d.signedUrl).filter(Boolean)));
  }, [r.photo_paths]);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await rpc('officer_update_status', { p_report_id: r.id, p_status: status, p_note: note, p_agency: agency || null, p_needs_field_check: field });
      setNote('');
      onDone();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="border-t border-gov-light p-5 grid lg:grid-cols-2 gap-6 text-sm bg-slate-50/50 rounded-b-[20px]">
      <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-slate-500 font-medium">Lokasi</dt><dd className="font-semibold text-gov-dark">{[r.desa, r.kecamatan, r.kabkota_name, r.regions?.name].filter(Boolean).join(', ')}</dd>
        <dt className="text-slate-500 font-medium">Kejadian</dt><dd className="font-semibold text-gov-dark">{r.incident_date}</dd>
        <dt className="text-slate-500 font-medium">Kios</dt><dd className="font-semibold text-gov-dark">{r.kiosk_name || '–'}</dd>
        <dt className="text-slate-500 font-medium">Pupuk</dt><dd className="font-semibold text-gov-dark">{r.fertilizer_id || '–'} {r.quantity_kg ? `• ${r.quantity_kg} kg` : ''}</dd>
        <dt className="text-slate-500 font-medium">Harga/kg</dt><dd className="font-semibold text-red-700">{r.price_paid_per_kg ? `Rp${Number(r.price_paid_per_kg).toLocaleString('id-ID')} (HET Rp${r.het_per_kg?.toLocaleString('id-ID') ?? '–'})` : '–'}</dd>
        <dt className="text-slate-500 font-medium">Kontak</dt><dd className="font-semibold text-gov-dark">{r.contact || 'tidak diberikan'}</dd>
        <dt className="text-slate-500 font-medium">Kronologi</dt><dd className="whitespace-pre-wrap text-slate-700 bg-white p-3 rounded-xl border border-gov-light">{r.description}</dd>
        <dt className="text-slate-500 font-medium">Foto Bukti</dt>
        <dd className="flex flex-wrap gap-2.5">
          {photoUrls.length ? photoUrls.map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={`Bukti ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border-2 border-gov-border shadow-sm hover:opacity-90" /></a>) : <span className="inline-flex items-center gap-1.5 text-slate-400 py-1"><ImageIcon className="w-4 h-4" />Tidak ada foto</span>}
        </dd>
      </dl>

      {NEXT[r.status].length ? (
        <form onSubmit={save} className="space-y-3.5 bg-white p-5 rounded-2xl border border-gov-border">
          <label className="block space-y-1.5"><span className="font-bold text-gov-dark">Tentukan Status Baru</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-gov-border text-sm font-semibold bg-white focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft">
              {NEXT[r.status].map((s) => <option key={s} value={s}>{REPORT_STATUS[s].label}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5"><span className="font-bold text-gov-dark">Instansi Penanggung Jawab</span>
            <input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="mis. Dinas Pertanian Kab. Lombok Tengah" className="w-full px-3.5 py-2.5 rounded-xl border border-gov-border text-sm focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-gov-dark cursor-pointer py-1"><input type="checkbox" checked={field} onChange={(e) => setField(e.target.checked)} className="w-4 h-4 text-gov-forest rounded" />Perlu pemeriksaan lapangan (tenggat SLA 60 hari kerja)</label>
          <label className="block space-y-1.5"><span className="font-bold text-gov-dark">Catatan Perkembangan Publik (Tampil di Cek Laporan)</span>
            <textarea required value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder="Tuliskan tindakan yang diambil agar pelapor mengetahui perkembangan..." className="w-full px-3.5 py-2.5 rounded-xl border border-gov-border text-sm focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
          </label>
          {msg && <p className="text-sm text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200" role="alert">{msg}</p>}
          <button className="px-6 py-2.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-sm font-bold transition-colors min-h-[44px]">Simpan Perkembangan</button>
        </form>
      ) : (
        <div className="bg-white p-5 rounded-2xl border border-gov-light flex items-center justify-center text-center">
          <p className="text-slate-600 font-medium">{r.status === 'selesai_instansi' ? 'Menunggu konfirmasi penyelesaian dari pihak pelapor (10 hari kerja).' : 'Laporan ini sudah ditutup.'}</p>
        </div>
      )}
    </div>
  );
}
