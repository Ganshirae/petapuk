import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ExternalLink, ClipboardList } from 'lucide-react';

// Sumber: Permentan 15/2025 (Pasal 3, 24, 39) jo. Permentan 3/2026; rilis Kementan 29 Sep 2026; Pupuk Indonesia Okt 2026.
const COMMODITIES = [
  { group: 'Tanaman pangan', items: ['Padi', 'Jagung', 'Kedelai', 'Ubi kayu'] },
  { group: 'Hortikultura', items: ['Cabai', 'Bawang merah', 'Bawang putih'] },
  { group: 'Perkebunan rakyat', items: ['Tebu rakyat', 'Kakao', 'Kopi'] }
];
const ALL = COMMODITIES.flatMap((g) => g.items);

const SOURCES = [
  { label: 'Permentan No. 15 Tahun 2025', url: 'https://peraturan.bpk.go.id/Details/319663/permentan-no-15-tahun-2025' },
  { label: 'Permentan No. 3 Tahun 2026', url: 'https://peraturan.bpk.go.id/Details/350110/permentan-no-3-tahun-2026' },
  { label: 'Kementan: pembukaan e-RDKK 2027 (29 Sep 2026)', url: 'https://pertanian.go.id/index.php/news/view/8163' },
  { label: 'Pupuk Indonesia: menebus di kios resmi', url: 'https://www.pupuk-indonesia.com/media-info/detail/896/membeli-pupuk-subsidi-di-kios-resmi-lebih-aman' }
];

const Q = ({ n, title, children }) => (
  <fieldset className="bg-white border border-gov-light rounded-[22px] p-5 sm:p-6 space-y-3">
    <legend className="sr-only">{title}</legend>
    <p className="text-base font-bold text-gov-dark">{n}. {title}</p>
    {children}
  </fieldset>
);

const Choice = ({ name, value, current, onChange, children }) => (
  <label className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-lg cursor-pointer text-base transition-colors ${current === value ? 'border-gov-emerald bg-gov-light' : 'border-gov-light hover:border-gov-border'}`}>
    <input type="radio" name={name} checked={current === value} onChange={() => onChange(value)} className="text-gov-forest" />{children}
  </label>
);

export default function Eligibility({ setActivePage }) {
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [group, setGroup] = useState('');
  const [rdkk, setRdkk] = useState('');

  const areaNum = Number(String(area).replace(',', '.'));
  const answered = crop && area && group && rdkk;
  const reasons = [];
  if (crop === 'lainnya') reasons.push('Komoditas Anda tidak termasuk 10 komoditas penerima pupuk bersubsidi.');
  if (area && !(areaNum > 0)) reasons.push('Isi luas lahan dengan angka lebih dari 0.');
  if (areaNum > 2) reasons.push(`Luas lahan ${areaNum} ha melebihi batas 2 ha per musim tanam. Subsidi hanya untuk maksimal 2 ha.`);
  if (group === 'tidak') reasons.push('Anda wajib menjadi anggota kelompok tani.');

  const verdict = !answered ? null : reasons.some((r) => !r.startsWith('Luas lahan')) ? 'tidak' : rdkk === 'ya' ? 'layak' : 'daftar';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="bg-gov-light border border-gov-border p-6 sm:p-7 rounded-[22px] space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gov-dark tracking-tight">Apakah saya berhak pupuk bersubsidi?</h1>
        <p className="text-base text-slate-600">
          Jawab 4 pertanyaan. Tidak ada data yang disimpan. Pendaftaran resmi hanya lewat kelompok tani dan penyuluh ke sistem e-RDKK Kementerian Pertanian. PEPUK tidak bisa mendaftarkan Anda secara langsung.
        </p>
      </header>

      <Q n={1} title="Apa tanaman utama Anda?">
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full px-3 py-3 rounded-lg border border-gov-border text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft">
          <option value="">Pilih…</option>
          {COMMODITIES.map((g) => (
            <optgroup key={g.group} label={g.group}>{g.items.map((i) => <option key={i} value={i}>{i}</option>)}</optgroup>
          ))}
          <option value="lainnya">Lainnya (sayur lain, buah, sawit, karet, dll.)</option>
        </select>
      </Q>

      <Q n={2} title="Berapa luas lahan yang Anda garap per musim tanam?">
        <div className="flex items-center gap-2">
          <input type="number" inputMode="decimal" min="0" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} placeholder="mis. 0,5" className="w-40 px-3 py-3 rounded-lg border border-gov-border text-base font-accent focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft" />
          <span className="text-base text-slate-600">hektare (1 ha = 10.000 m², ±100 are)</span>
        </div>
      </Q>

      <Q n={3} title="Apakah Anda anggota kelompok tani (poktan)?">
        <div className="grid sm:grid-cols-3 gap-2">
          <Choice name="group" value="ya" current={group} onChange={setGroup}>Ya</Choice>
          <Choice name="group" value="tidak" current={group} onChange={setGroup}>Tidak</Choice>
          <Choice name="group" value="ragu" current={group} onChange={setGroup}>Tidak tahu</Choice>
        </div>
      </Q>

      <Q n={4} title="Apakah nama Anda sudah terdaftar di e-RDKK?">
        <div className="grid sm:grid-cols-3 gap-2">
          <Choice name="rdkk" value="ya" current={rdkk} onChange={setRdkk}>Ya, sudah</Choice>
          <Choice name="rdkk" value="tidak" current={rdkk} onChange={setRdkk}>Belum</Choice>
          <Choice name="rdkk" value="ragu" current={rdkk} onChange={setRdkk}>Tidak tahu</Choice>
        </div>
        <p className="text-xs text-slate-500">Cek di <a href="https://pupukbersubsidi.pertanian.go.id/ceksubsidi/search" target="_blank" rel="noopener noreferrer" className="underline font-bold">Cek Subsidi Kementan</a>: pilih provinsi sampai kecamatan, lalu ketik nama sesuai KTP. Tidak perlu NIK.</p>
      </Q>

      {verdict && (
        <section aria-live="polite" className={`rounded-gov p-6 space-y-3 border-2 ${verdict === 'layak' ? 'border-gov-forest bg-gov-light' : verdict === 'daftar' ? 'border-gov-pink bg-[#FFF5F9]' : 'border-red-300 bg-red-50'}`}>
          <h2 className="text-xl font-bold text-gov-dark flex items-center gap-2">
            {verdict === 'layak' ? <CheckCircle2 className="w-6 h-6 text-gov-forest" /> : verdict === 'daftar' ? <HelpCircle className="w-6 h-6 text-gov-pink" /> : <XCircle className="w-6 h-6 text-red-700" />}
            {verdict === 'layak' ? 'Kemungkinan besar Anda berhak' : verdict === 'daftar' ? 'Anda bisa berhak, tetapi perlu didaftarkan dulu' : 'Kemungkinan Anda belum memenuhi syarat'}
          </h2>
          {reasons.length > 0 && <ul className="list-disc pl-5 text-base text-slate-800 space-y-1">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
          {group === 'ragu' && <p className="text-base text-slate-800">Tanyakan ke penyuluh (PPL) desa atau kantor BPP kecamatan apakah Anda tercatat di kelompok tani.</p>}

          {verdict === 'layak' && (
            <div className="text-base text-slate-800 space-y-1">
              <p className="font-bold">Cara menebus:</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Datang ke kios resmi (pengecer) di wilayah Anda.</li>
                <li>Bawa <strong>KTP</strong> dan uang tunai sesuai HET. Kartu Tani tidak wajib.</li>
                <li>Kios mencatat penebusan di aplikasi i-Pubers. Minta nota.</li>
                <li>Jika ditolak, harga di atas HET, atau dipaksa membeli paket, <button onClick={() => setActivePage('report')} className="underline font-bold">laporkan di sini</button>.</li>
              </ol>
            </div>
          )}

          {(verdict === 'daftar' || rdkk === 'ragu') && verdict !== 'tidak' && (
            <div className="text-base text-slate-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5"><ClipboardList className="w-5 h-5" />Langkah mendaftar (resmi):</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Bergabung ke kelompok tani di desa Anda (tanya ketua poktan atau kepala desa).</li>
                <li>Serahkan data ke ketua poktan atau penyuluh (PPL): nama sesuai KTP, NIK, luas lahan, komoditas, dan rencana tanam. Data ini diserahkan langsung ke penyuluh, <strong>bukan ke PEPUK</strong>.</li>
                <li>Penyuluh dan Dinas Pertanian kabupaten/kota memasukkan dan memverifikasi data di e-RDKK, lalu disahkan Kepala Dinas.</li>
                <li>Pendaftaran e-RDKK tahun anggaran 2027 dibuka sejak 22 September 2026. Segera hubungi penyuluh karena data yang sudah disahkan tidak bisa diubah.</li>
                <li>Setelah terdaftar, cek nama Anda di Cek Subsidi Kementan, lalu tebus di kios resmi dengan KTP.</li>
              </ol>
            </div>
          )}
        </section>
      )}

      <section className="bg-white border border-gov-light rounded-[22px] p-6 sm:p-7 space-y-3">
        <h2 className="text-lg font-bold text-gov-dark">Syarat penerima menurut aturan</h2>
        <ul className="text-base text-slate-700 list-disc pl-5 space-y-1.5">
          <li>Petani komoditas: {ALL.join(', ')}.</li>
          <li>Lahan garapan paling luas 2 hektare setiap musim tanam.</li>
          <li>Tergabung dalam kelompok tani dan terdaftar dalam e-RDKK (tersinkron dengan SIMLUHTAN).</li>
          <li>Penebusan memakai KTP di kios resmi dengan harga sesuai HET.</li>
        </ul>
        <a href="https://pupukbersubsidi.pertanian.go.id/ceksubsidi/search" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors">
          Buka Cek Subsidi Kementan <ExternalLink className="w-4 h-4" />
        </a>
        <div className="pt-2 border-t border-gov-light">
          <p className="text-xs font-semibold text-slate-500 uppercase font-accent mb-1">Dasar</p>
          <ul className="text-sm space-y-0.5">{SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gov-forest underline">{s.label}</a></li>)}</ul>
        </div>
      </section>
    </div>
  );
}
