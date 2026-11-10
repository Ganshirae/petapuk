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
      <form onSubmit={login} className="max-w-sm mx-auto bg-white border border-gov-light rounded-[22px] p-6 space-y-3">
        <h1 className="text-xl font-bold text-gov-dark">Masuk petugas</h1>
        <p className="text-xs text-slate-600">Khusus verifikator instansi. Akun dibuat oleh admin.</p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="username" className="w-full px-3 py-2.5 rounded-lg border border-gov-border text-sm focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi" autoComplete="current-password" className="w-full px-3 py-2.5 rounded-lg border border-gov-border text-sm focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
        {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
        <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gov-forest hover:bg-gov-hover text-white text-sm font-bold transition-colors"><LogIn className="w-4 h-4" />Masuk</button>
      </form>
    );
  }

  if (officer === undefined) return <p className="text-center text-sm text-slate-500 py-10">Memuat…</p>;
  if (officer === null) {
    return (
      <div className="max-w-sm mx-auto bg-white border border-gov-light rounded-[22px] p-6 space-y-3 text-sm">
        <p>Akun <strong>{session.user.email}</strong> belum terdaftar sebagai petugas.</p>
        <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 rounded border border-slate-300 font-bold">Keluar</button>
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
    <div className="space-y-4">
      <header className="bg-gov-light border border-gov-border rounded-[22px] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gov-dark">Antrian laporan</h1>
          <p className="text-xs text-slate-600">{officer.name} • {officer.agency}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-2 py-1.5 rounded border border-slate-300">
            <option value="aktif">Belum selesai</option>
            <option value="semua">Semua</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 font-bold"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Muat ulang</button>
          <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 font-bold"><LogOut className="w-3.5 h-3.5" />Keluar</button>
        </div>
      </header>

      {reports.length === 0 && <p className="text-sm text-slate-500 text-center py-8">Tidak ada laporan.</p>}
      <ul className="space-y-2">
        {reports.map((r) => {
          const overdue = r.due_at && new Date(r.due_at).getTime() < now && !['selesai', 'ditolak'].includes(r.status);
          return (
            <li key={r.id} className={`bg-white border rounded-[18px] ${overdue ? 'border-red-300' : 'border-gov-light'}`}>
              <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="w-full text-left p-4 grid sm:grid-cols-[1fr_auto] gap-2 rounded-[18px]">
                <div>
                  <p className="font-accent font-bold text-sm text-gov-dark">{r.public_id}</p>
                  <p className="text-xs text-slate-600">{REPORT_CATEGORIES.find((c) => c.id === r.category)?.title} • {[r.kabkota_name, r.regions?.name].filter(Boolean).join(', ')}</p>
                </div>
                <div className="text-xs sm:text-right">
                  <p className="font-bold">{REPORT_STATUS[r.status]?.label}</p>
                  <p className={overdue ? 'text-red-700 font-bold' : 'text-slate-500'}>{overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}Tenggat {dt(r.due_at)}</p>
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
    <div className="border-t border-gov-light p-4 grid lg:grid-cols-2 gap-4 text-xs">
      <dl className="grid grid-cols-[7rem_1fr] gap-x-2 gap-y-1">
        <dt className="text-slate-500">Lokasi</dt><dd>{[r.desa, r.kecamatan, r.kabkota_name, r.regions?.name].filter(Boolean).join(', ')}</dd>
        <dt className="text-slate-500">Kejadian</dt><dd>{r.incident_date}</dd>
        <dt className="text-slate-500">Kios</dt><dd>{r.kiosk_name || '–'}</dd>
        <dt className="text-slate-500">Pupuk</dt><dd>{r.fertilizer_id || '–'} {r.quantity_kg ? `• ${r.quantity_kg} kg` : ''}</dd>
        <dt className="text-slate-500">Harga/kg</dt><dd>{r.price_paid_per_kg ? `Rp${Number(r.price_paid_per_kg).toLocaleString('id-ID')} (HET Rp${r.het_per_kg?.toLocaleString('id-ID') ?? '–'})` : '–'}</dd>
        <dt className="text-slate-500">Kontak</dt><dd>{r.contact || 'tidak diberikan'}</dd>
        <dt className="text-slate-500">Kronologi</dt><dd className="whitespace-pre-wrap">{r.description}</dd>
        <dt className="text-slate-500">Foto</dt>
        <dd className="flex flex-wrap gap-2">
          {photoUrls.length ? photoUrls.map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={`Bukti ${i + 1}`} className="w-20 h-20 object-cover rounded border" /></a>) : <span className="inline-flex items-center gap-1 text-slate-400"><ImageIcon className="w-3.5 h-3.5" />tidak ada</span>}
        </dd>
      </dl>

      {NEXT[r.status].length ? (
        <form onSubmit={save} className="space-y-2">
          <label className="block space-y-1"><span className="font-bold">Status baru</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-2 py-2 rounded border border-slate-300">
              {NEXT[r.status].map((s) => <option key={s} value={s}>{REPORT_STATUS[s].label}</option>)}
            </select>
          </label>
          <label className="block space-y-1"><span className="font-bold">Instansi penanggung jawab</span>
            <input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="mis. Dinas Pertanian Kab. Lombok Tengah" className="w-full px-2 py-2 rounded border border-slate-300" />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={field} onChange={(e) => setField(e.target.checked)} />Perlu pemeriksaan lapangan (tenggat 60 hari kerja)</label>
          <label className="block space-y-1"><span className="font-bold">Catatan publik (tampil di halaman lacak)</span>
            <textarea required value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} className="w-full px-2 py-2 rounded border border-slate-300" />
          </label>
          {msg && <p className="text-red-700" role="alert">{msg}</p>}
          <button className="px-4 py-2 rounded bg-gov-forest text-white font-bold">Simpan</button>
        </form>
      ) : (
        <p className="text-slate-600">{r.status === 'selesai_instansi' ? 'Menunggu konfirmasi pelapor (10 hari).' : 'Laporan sudah ditutup.'}</p>
      )}
    </div>
  );
}
