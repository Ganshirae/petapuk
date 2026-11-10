import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, ChevronLeft, ChevronRight, Upload, Trash2, Send, AlertCircle, Lock, ShieldCheck, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';
import { REPORT_CATEGORIES, KECAMATAN_MAP } from '../data/ntbData';
import { saveDraft, getDraft, clearDraft, addMyReport } from '../utils/storage';
import { supabase, rpc } from '../lib/supabase';

const MAX_PHOTOS = 3;
const MAX_MB = 5;
const today = () => new Date().toISOString().slice(0, 10);
const rp = (n) => `Rp${Math.round(n).toLocaleString('id-ID')}`;

// Gambar ulang lewat canvas: membuang metadata EXIF (termasuk lokasi GPS) dan memperkecil ukuran.
async function stripExif(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
}

const field = 'w-full px-4 py-3 rounded-xl border border-gov-border bg-white text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft transition-colors';
const labelCls = 'block text-sm font-semibold text-gov-dark mb-1.5 font-accent';

export default function ReportForm({ data, setActivePage, setSubmittedReport, prefilledData }) {
  const { regions, fertilizers, het } = data;
  const provinces = useMemo(() => regions.filter((r) => r.level === 'provinsi'), [regions]);
  const kabkotaOf = (prov) => regions.filter((r) => r.parent_code === prov);
  const hetOf = (fid) => het.find((h) => h.fertilizer_id === fid);

  // Prefill dari dashboard (kode bisa provinsi atau kab/kota)
  const pre = prefilledData || {};
  const preRegion = regions.find((r) => r.code === pre.regionCode);
  const initial = {
    category: pre.category || 'harga_di_atas_het',
    fertilizerId: pre.fertilizerId || 'urea',
    province: preRegion ? preRegion.parent_code || preRegion.code : '52',
    kabkota: preRegion?.level === 'kabkota' ? preRegion.code : '',
    kabkotaText: '',
    kecamatan: '',
    desa: '',
    incidentDate: today(),
    kioskName: '',
    quantityKg: pre.quantityKg ? String(pre.quantityKg) : '',
    pricePaidPerKg: pre.pricePaidPerKg ? String(pre.pricePaidPerKg) : '',
    description: ''
  };

  const [step, setStep] = useState(1);
  const [f, setF] = useState(() => (prefilledData ? initial : { ...initial, ...(getDraft() || {}) }));
  const [photos, setPhotos] = useState([]); // { file, url }
  const [contact, setContact] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  // Draf otomatis (tanpa kontak & foto)
  useEffect(() => {
    const t = setTimeout(() => saveDraft(f), 400);
    return () => clearTimeout(t);
  }, [f]);

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const kabkotaList = kabkotaOf(f.province);
  const hasKabkotaData = kabkotaList.length > 0;
  const kecamatanList = KECAMATAN_MAP[f.kabkota] || [];
  const isPrice = f.category === 'harga_di_atas_het';
  const needsFert = isPrice || ['stok_kosong', 'paket_paksa', 'pupuk_palsu', 'penebusan_diwakilkan'].includes(f.category);
  const h = hetOf(f.fertilizerId);
  const priceNum = Number(f.pricePaidPerKg) || 0;
  const overBy = h && priceNum > h.price_per_kg ? priceNum - h.price_per_kg : 0;

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!f.category) e.category = 'Pilih jenis masalah.';
      if (needsFert && !f.fertilizerId) e.fertilizerId = 'Pilih jenis pupuk.';
    }
    if (s === 2) {
      if (!f.province) e.province = 'Pilih provinsi.';
      if (hasKabkotaData && !f.kabkota) e.kabkota = 'Pilih kabupaten/kota.';
      if (!hasKabkotaData && !f.kabkotaText.trim()) e.kabkota = 'Tulis nama kabupaten/kota.';
      if (!f.incidentDate) e.incidentDate = 'Tanggal kejadian wajib diisi.';
      else if (f.incidentDate > today()) e.incidentDate = 'Tanggal tidak boleh di masa depan.';
    }
    if (s === 3) {
      if (isPrice && !(priceNum > 0)) e.pricePaidPerKg = 'Isi harga yang Anda bayar per kg.';
      if (f.quantityKg && !(Number(f.quantityKg) > 0)) e.quantityKg = 'Jumlah harus lebih dari 0.';
      const len = f.description.trim().length;
      if (len < 20) e.description = `Ceritakan kronologi minimal 20 karakter (sekarang ${len}).`;
      if (len > 2000) e.description = 'Maksimal 2000 karakter.';
    }
    if (s === 4 && !agree) e.agree = 'Centang pernyataan ini untuk mengirim.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (d) => {
    if (d > 0 && !validate(step)) return;
    setStep((s) => s + d);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (photos.length + files.length > MAX_PHOTOS) return setErrors({ photos: `Maksimal ${MAX_PHOTOS} foto.` });
    const bad = files.find((x) => !x.type.startsWith('image/') || x.size > MAX_MB * 1024 * 1024);
    if (bad) return setErrors({ photos: `"${bad.name}" bukan gambar atau lebih dari ${MAX_MB} MB.` });
    setErrors({});
    setPhotos((p) => [...p, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(4)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const photoPaths = [];
      for (const p of photos) {
        const path = `reports/${crypto.randomUUID()}.jpg`;
        const blob = await stripExif(p.file);
        const { error } = await supabase.storage.from('report-evidence').upload(path, blob, { contentType: 'image/jpeg' });
        if (error) throw new Error(`Foto gagal diunggah: ${error.message}`);
        photoPaths.push(path);
      }

      const regionName = regions.find((r) => r.code === (f.kabkota || f.province))?.name;
      const res = await rpc('submit_report', {
        p: {
          category: f.category,
          fertilizer_id: needsFert ? f.fertilizerId : null,
          region_code: f.kabkota || f.province,
          kabkota_name: hasKabkotaData ? null : f.kabkotaText,
          kecamatan: f.kecamatan,
          desa: f.desa,
          kiosk_name: f.kioskName,
          incident_date: f.incidentDate,
          quantity_kg: f.quantityKg || null,
          price_paid_per_kg: isPrice ? priceNum : f.pricePaidPerKg || null,
          description: f.description,
          contact,
          photo_paths: photoPaths
        }
      });

      const receipt = {
        publicId: res.public_id,
        secretCode: res.secret_code,
        dueAt: res.due_at,
        category: f.category,
        fertilizerName: needsFert ? fertilizers.find((x) => x.id === f.fertilizerId)?.name : null,
        regionName: hasKabkotaData ? regionName : `${f.kabkotaText}, ${regionName}`,
        createdAt: new Date().toISOString(),
        summary: { ...f, contactGiven: Boolean(contact.trim()), photoCount: photoPaths.length, hetPerKg: h?.price_per_kg }
      };
      addMyReport({ publicId: receipt.publicId, secretCode: receipt.secretCode, category: receipt.category, regionName: receipt.regionName, createdAt: receipt.createdAt });
      clearDraft();
      setSubmittedReport(receipt);
      setActivePage('receipt');
    } catch (err) {
      setSubmitError(err.message || 'Laporan gagal dikirim. Periksa koneksi lalu coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="text-xs text-red-700 mt-1 flex items-center gap-1" role="alert"><AlertCircle className="w-3.5 h-3.5" />{errors[k]}</p> : null);

  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-7">
      <header className="bg-white border border-white p-5 sm:p-8 lg:p-10 rounded-[20px] sm:rounded-[24px] space-y-2.5 sm:space-y-3 shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)]">
        <h1 className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold text-gov-dark tracking-tight leading-[1.2]">
          Laporkan masalah pupuk bersubsidi
        </h1>
        <p className="text-sm sm:text-lg text-slate-600 max-w-4xl leading-relaxed">
          Sampaikan penyelewengan harga di atas HET, kelangkaan stok, atau pemaksaan paket di kios Anda. Anda akan menerima <strong>ID laporan</strong> dan <strong>kode rahasia</strong> untuk memantau tindak lanjut secara transparan. Laporan tidak bisa ditutup tanpa konfirmasi Anda.
        </p>
      </header>

      {/* Grid 2-Kolom: Form Pelaporan di Kiri + Jaminan Privasi & Alur di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Kolom Kiri: Stepper & Formulir Input */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-5">
          <ol className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs sm:text-sm font-bold font-accent" aria-label="Langkah pelaporan">
            {['Masalah', 'Lokasi', 'Bukti', 'Kirim'].map((t, i) => (
              <li key={t} aria-current={step === i + 1 ? 'step' : undefined}
                className={`py-2 sm:py-3 px-1 rounded-xl border transition-colors ${step === i + 1 ? 'bg-gov-dark text-white border-gov-dark shadow-sm' : step > i + 1 ? 'bg-gov-soft text-gov-dark border-gov-border' : 'bg-white text-slate-500 border-gov-light'}`}>
                <span className="sm:inline">{i + 1}. </span>
                <span className="truncate">{t}</span>
              </li>
            ))}
          </ol>

          <form onSubmit={submit} className="bg-white border border-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 lg:p-8 space-y-5 sm:space-y-6 shadow-sm" noValidate>
            {step === 1 && (
              <>
                <fieldset>
                  <legend className="block text-base font-bold text-gov-dark mb-3 font-accent">Apa masalahnya? <span className="text-red-600">*</span></legend>
                  <div className="space-y-2.5">
                    {REPORT_CATEGORIES.map((c) => (
                      <label key={c.id} className={`flex gap-3.5 p-4 border rounded-xl cursor-pointer transition-colors ${f.category === c.id ? 'border-gov-emerald bg-gov-light/70 border-l-4' : 'border-gov-light hover:border-gov-border'}`}>
                        <input type="radio" name="category" value={c.id} checked={f.category === c.id} onChange={set('category')} className="mt-1 text-gov-forest" />
                        <span><strong className="text-base text-gov-dark block">{c.title}</strong><span className="text-sm text-slate-600 mt-0.5 block">{c.desc}</span></span>
                      </label>
                    ))}
                  </div>
                  <Err k="category" />
                </fieldset>
                {needsFert && (
                  <div className="pt-2">
                    <label htmlFor="fert" className={labelCls}>Jenis pupuk <span className="text-red-600">*</span></label>
                    <select id="fert" value={f.fertilizerId} onChange={set('fertilizerId')} className={field}>
                      {fertilizers.filter((x) => hetOf(x.id)).map((x) => (
                        <option key={x.id} value={x.id}>{x.name} (HET {rp(hetOf(x.id).price_per_kg)}/kg)</option>
                      ))}
                    </select>
                    <Err k="fertilizerId" />
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="prov" className={labelCls}>Provinsi <span className="text-red-600">*</span></label>
                    <select id="prov" value={f.province} onChange={(e) => setF((p) => ({ ...p, province: e.target.value, kabkota: '', kecamatan: '' }))} className={field}>
                      {provinces.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                    </select>
                    <Err k="province" />
                  </div>
                  <div>
                    <label htmlFor="kab" className={labelCls}>Kabupaten/kota <span className="text-red-600">*</span></label>
                    {hasKabkotaData ? (
                      <select id="kab" value={f.kabkota} onChange={(e) => setF((p) => ({ ...p, kabkota: e.target.value, kecamatan: '' }))} className={field}>
                        <option value="">Pilih kabupaten/kota…</option>
                        {kabkotaList.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                      </select>
                    ) : (
                      <input id="kab" value={f.kabkotaText} onChange={set('kabkotaText')} maxLength={100} placeholder="mis. Kabupaten Lombok Tengah" className={field} />
                    )}
                    <Err k="kabkota" />
                  </div>
                  <div>
                    <label htmlFor="kec" className={labelCls}>Kecamatan</label>
                    {kecamatanList.length ? (
                      <select id="kec" value={f.kecamatan} onChange={set('kecamatan')} className={field}>
                        <option value="">Pilih kecamatan…</option>
                        {kecamatanList.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    ) : (
                      <input id="kec" value={f.kecamatan} onChange={set('kecamatan')} maxLength={100} placeholder="mis. Kecamatan Praya" className={field} />
                    )}
                  </div>
                  <div>
                    <label htmlFor="desa" className={labelCls}>Desa/kelurahan</label>
                    <input id="desa" value={f.desa} onChange={set('desa')} maxLength={100} placeholder="mis. Desa Puyung" className={field} />
                  </div>
                  <div>
                    <label htmlFor="tgl" className={labelCls}>Tanggal kejadian <span className="text-red-600">*</span></label>
                    <input id="tgl" type="date" max={today()} value={f.incidentDate} onChange={set('incidentDate')} className={field} />
                    <Err k="incidentDate" />
                  </div>
                  <div>
                    <label htmlFor="kios" className={labelCls}>Nama kios/pengecer</label>
                    <input id="kios" value={f.kioskName} onChange={set('kioskName')} maxLength={150} placeholder="mis. UD Tani Makmur" className={field} />
                    <p className="text-xs text-slate-500 mt-1.5">Nama kios tidak ditampilkan publik sebelum laporan diverifikasi.</p>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="qty" className={labelCls}>Jumlah pupuk (kg)</label>
                    <input id="qty" type="number" inputMode="decimal" min="1" value={f.quantityKg} onChange={set('quantityKg')} placeholder="mis. 50" className={field} />
                    <Err k="quantityKg" />
                  </div>
                  <div>
                    <label htmlFor="price" className={labelCls}>Harga dibayar per kg (Rp) {isPrice && <span className="text-red-600">*</span>}</label>
                    <input id="price" type="number" inputMode="numeric" min="1" value={f.pricePaidPerKg} onChange={set('pricePaidPerKg')} placeholder={h ? `HET ${h.price_per_kg}` : ''} className={field} />
                    <Err k="pricePaidPerKg" />
                  </div>
                </div>
                {needsFert && h && priceNum > 0 && (
                  <p className={`text-sm p-4 rounded-xl border leading-relaxed ${overBy ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gov-light border-gov-border text-gov-forest'}`} aria-live="polite">
                    {overBy
                      ? `Lebih mahal ${rp(overBy)}/kg dari HET resmi ${rp(h.price_per_kg)}/kg${Number(f.quantityKg) > 0 ? `, total kelebihan pembayaran ${rp(overBy * Number(f.quantityKg))}` : ''}.`
                      : `Sesuai HET resmi (${rp(h.price_per_kg)}/kg).`}
                  </p>
                )}
                <div>
                  <label htmlFor="desc" className={labelCls}>Kronologi kejadian <span className="text-red-600">*</span></label>
                  <textarea id="desc" rows={5} value={f.description} onChange={set('description')} maxLength={2000} className={field}
                    placeholder="Ceritakan apa yang terjadi, kapan, siapa yang melayani di kios, dan alasan apa yang diberikan jika harga dinaikkan." />
                  <p className="text-xs text-slate-500 text-right mt-1">{f.description.trim().length}/2000</p>
                  <Err k="description" />
                </div>
                <div>
                  <span className={labelCls}>Foto bukti (nota pembelian, karung pupuk, papan kios), opsional</span>
                  <div className="flex flex-wrap gap-2.5">
                    {photos.map((p, i) => (
                      <div key={p.url} className="relative w-28 h-28 rounded-xl border border-gov-border overflow-hidden">
                        <img src={p.url} alt={`Bukti ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))} aria-label={`Hapus foto ${i + 1}`}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 text-red-700 shadow-sm hover:bg-white"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <label className="w-28 h-28 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gov-border rounded-xl cursor-pointer hover:border-gov-emerald text-xs text-slate-600 hover:bg-gov-light/30 transition-colors">
                        <Upload className="w-5 h-5 text-gov-forest" />Tambah
                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="sr-only" />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Maks. {MAX_PHOTOS} foto. Data lokasi GPS di dalam foto otomatis dihapus demi keamanan privasi Anda.</p>
                  <Err k="photos" />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <dl className="text-sm grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 p-4 bg-gov-light/60 border border-gov-border rounded-xl">
                  <dt className="text-slate-500">Masalah</dt><dd className="font-semibold text-gov-dark">{REPORT_CATEGORIES.find((c) => c.id === f.category)?.title}</dd>
                  {needsFert && <><dt className="text-slate-500">Pupuk</dt><dd className="font-semibold text-gov-dark">{fertilizers.find((x) => x.id === f.fertilizerId)?.name}</dd></>}
                  <dt className="text-slate-500">Lokasi</dt><dd className="font-semibold text-gov-dark">{[f.desa, f.kecamatan, hasKabkotaData ? regions.find((r) => r.code === f.kabkota)?.name : f.kabkotaText, regions.find((r) => r.code === f.province)?.name].filter(Boolean).join(', ')}</dd>
                  <dt className="text-slate-500">Tanggal</dt><dd className="font-semibold text-gov-dark">{f.incidentDate}</dd>
                  {f.kioskName && <><dt className="text-slate-500">Kios</dt><dd className="font-semibold text-gov-dark">{f.kioskName}</dd></>}
                  {priceNum > 0 && <><dt className="text-slate-500">Harga/kg</dt><dd className="font-semibold text-gov-dark">{rp(priceNum)}{h && ` (HET ${rp(h.price_per_kg)})`}</dd></>}
                  <dt className="text-slate-500">Foto</dt><dd className="font-semibold text-gov-dark">{photos.length} berkas</dd>
                </dl>
                <div>
                  <label htmlFor="contact" className={labelCls}>Kontak (opsional): nomor WA atau email</label>
                  <input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} autoComplete="off" placeholder="08xxxxxxxxxx (kosongkan jika ingin 100% anonim)" className={field} />
                  <p className="text-xs text-slate-500 mt-1.5 flex gap-1.5 items-center"><Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />Hanya dilihat petugas jika butuh klarifikasi nota/lokasi. Tidak pernah ditampilkan publik.</p>
                </div>
                <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer p-1">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-4 h-4 rounded text-gov-forest focus:ring-gov-emerald" />
                  <span>Saya menyatakan laporan ini sesuai kejadian sebenarnya dan memahami bahwa laporan palsu dapat ditolak.</span>
                </label>
                <Err k="agree" />
                {submitError && <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-2" role="alert"><ShieldAlert className="w-5 h-5 shrink-0 text-red-700 mt-0.5" />{submitError}</p>}
              </>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-3 border-t border-gov-light">
              {step > 1 ? (
                <button type="button" onClick={() => go(-1)} className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-gov-border text-gov-dark text-base font-bold hover:bg-gov-light transition-colors min-h-[48px]"><ChevronLeft className="w-4 h-4" />Kembali</button>
              ) : <span className="hidden sm:inline" />}
              {step < 4 ? (
                <button type="button" onClick={() => go(1)} className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px] shadow-sm">Lanjut<ChevronRight className="w-4 h-4" /></button>
              ) : (
                <button type="submit" disabled={submitting} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold disabled:opacity-60 min-h-[48px] transition-colors shadow-sm">
                  <Send className="w-4 h-4" />{submitting ? 'Mengirim…' : 'Kirim laporan'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Jaminan Keamanan, Hak Pelapor & Kanal Resmi (Sticky) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-[96px]">
          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-gov-dark flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-gov-forest" />
              Jaminan Privasi & Perlindungan
            </h2>
            <ul className="text-sm sm:text-base text-slate-700 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gov-emerald mt-1 shrink-0" />
                <span><strong>Tanpa Akun & Tanpa KTP:</strong> Identitas pribadi Anda tidak disimpan di pelaporan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gov-emerald mt-1 shrink-0" />
                <span><strong>Pembersihan Metadata EXIF:</strong> Lokasi GPS di dalam foto bukti otomatis dihapus sebelum dikirim ke server.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gov-emerald mt-1 shrink-0" />
                <span><strong>Kontrol di Tangan Anda:</strong> Laporan tidak dapat ditutup secara sepihak oleh instansi tanpa konfirmasi Anda.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gov-dark flex items-center gap-2">
              <Clock className="w-5 h-5 text-gov-forest" />
              Alur Waktu Tindak Lanjut
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-gov-light/60 rounded-xl border border-gov-border">
                <p className="font-bold text-gov-dark">1. Verifikasi (Maks. 3 Hari Kerja)</p>
                <p className="text-slate-600 mt-0.5">Petugas memvalidasi bukti nota dan kewajaran data yang Anda laporkan.</p>
              </div>
              <div className="p-3 bg-gov-light/60 rounded-xl border border-gov-border">
                <p className="font-bold text-gov-dark">2. Tindak Lanjut (Maks. 14 Hari Kerja)</p>
                <p className="text-slate-600 mt-0.5">Dinas terkait melakukan pengecekan langsung ke kios atau distributor.</p>
              </div>
              <div className="p-3 bg-gov-soft/70 rounded-xl border border-gov-border">
                <p className="font-bold text-gov-dark">3. Konfirmasi Pelapor</p>
                <p className="text-slate-600 mt-0.5">Anda mengecek apakah masalah sudah teratasi sebelum statusnya dinyatakan selesai.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
