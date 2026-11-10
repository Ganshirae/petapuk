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
  <fieldset className="bg-white border border-white rounded-[20px] sm:rounded-[22px] p-4 sm:p-7 space-y-3 shadow-sm">
    <legend className="sr-only">{title}</legend>
    <p className="text-base sm:text-lg font-bold text-gov-dark">{n}. {title}</p>
    {children}
  </fieldset>
);

const Choice = ({ name, value, current, onChange, children }) => (
  <label className={`flex items-center gap-3 px-3.5 py-3 border-2 rounded-xl cursor-pointer text-base font-medium transition-colors min-h-[48px] ${current === value ? 'border-gov-emerald bg-gov-light text-gov-dark font-bold shadow-sm' : 'border-gov-light bg-white text-slate-700 hover:border-gov-border'}`}>
    <input type="radio" name={name} checked={current === value} onChange={() => onChange(value)} className="w-4 h-4 text-gov-forest" />{children}
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
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-7">
      <header className="bg-white border border-white p-5 sm:p-8 lg:p-10 rounded-[20px] sm:rounded-[24px] space-y-2.5 sm:space-y-3 shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)]">
        <h1 className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold text-gov-dark tracking-tight leading-[1.2]">
          Apakah saya berhak pupuk bersubsidi?
        </h1>
        <p className="text-sm sm:text-lg text-slate-600 max-w-4xl leading-relaxed">
          Jawab 4 pertanyaan di bawah untuk mengecek kelayakan secara langsung. Tanpa akun dan tidak ada data yang disimpan. Pendaftaran resmi hanya lewat kelompok tani dan penyuluh (PPL) ke sistem e-RDKK Kementerian Pertanian.
        </p>
      </header>

      {/* Grid 2-Kolom: Formulir Interaktif di Kiri + Panduan & Regulasi di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Kolom Kiri: Pertanyaan & Hasil Verdict */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-5">
          <Q n={1} title="Apa tanaman utama Anda?">
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-gov-border text-base focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft bg-white">
              <option value="">Pilih komoditas tanaman…</option>
              {COMMODITIES.map((g) => (
                <optgroup key={g.group} label={g.group}>{g.items.map((i) => <option key={i} value={i}>{i}</option>)}</optgroup>
              ))}
              <option value="lainnya">Lainnya (sayur lain, buah, sawit, karet, dll.)</option>
            </select>
          </Q>

          <Q n={2} title="Berapa luas lahan yang Anda garap per musim tanam?">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
              <input type="number" inputMode="decimal" min="0" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} placeholder="mis. 0,5" className="w-full sm:w-48 px-4 py-3.5 rounded-xl border border-gov-border text-base font-accent focus:border-gov-emerald focus:ring-2 focus:ring-gov-soft bg-white" />
              <span className="text-sm sm:text-base text-slate-700 font-medium">hektare (1 ha = 10.000 m², ±100 are)</span>
            </div>
          </Q>

          <Q n={3} title="Apakah Anda anggota kelompok tani (poktan)?">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Choice name="group" value="ya" current={group} onChange={setGroup}>Ya</Choice>
              <Choice name="group" value="tidak" current={group} onChange={setGroup}>Tidak</Choice>
              <Choice name="group" value="ragu" current={group} onChange={setGroup}>Tidak tahu</Choice>
            </div>
          </Q>

          <Q n={4} title="Apakah nama Anda sudah terdaftar di e-RDKK?">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Choice name="rdkk" value="ya" current={rdkk} onChange={setRdkk}>Ya, sudah</Choice>
              <Choice name="rdkk" value="tidak" current={rdkk} onChange={setRdkk}>Belum</Choice>
              <Choice name="rdkk" value="ragu" current={rdkk} onChange={setRdkk}>Tidak tahu</Choice>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 pt-1">Cek di <a href="https://pupukbersubsidi.pertanian.go.id/ceksubsidi/search" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gov-dark hover:text-gov-emerald">Cek Subsidi Kementan</a>: pilih provinsi sampai kecamatan, lalu ketik nama sesuai KTP (tidak perlu NIK).</p>
          </Q>

          {verdict && (
            <section aria-live="polite" className={`rounded-[24px] p-6 sm:p-7 space-y-4 border-2 shadow-sm ${verdict === 'layak' ? 'border-gov-forest bg-gov-light' : verdict === 'daftar' ? 'border-gov-pink bg-[#FFF5F9]' : 'border-red-300 bg-red-50'}`}>
              <h2 className="text-xl sm:text-2xl font-bold text-gov-dark flex items-center gap-3">
                {verdict === 'layak' ? <CheckCircle2 className="w-7 h-7 text-gov-forest shrink-0" /> : verdict === 'daftar' ? <HelpCircle className="w-7 h-7 text-gov-pink shrink-0" /> : <XCircle className="w-7 h-7 text-red-700 shrink-0" />}
                {verdict === 'layak' ? 'Kemungkinan besar Anda berhak pupuk bersubsidi' : verdict === 'daftar' ? 'Anda bisa berhak, tetapi perlu didaftarkan dulu ke e-RDKK' : 'Kemungkinan Anda belum memenuhi syarat subsidi'}
              </h2>
              {reasons.length > 0 && <ul className="list-disc pl-6 text-base text-slate-800 space-y-1.5">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
              {group === 'ragu' && <p className="text-base text-slate-800">Tanyakan ke penyuluh (PPL) desa atau kantor BPP kecamatan apakah nama Anda tercatat di kelompok tani wilayah setempat.</p>}

              {verdict === 'layak' && (
                <div className="text-base text-slate-800 space-y-2 pt-2 border-t border-gov-dark/15">
                  <p className="font-bold text-gov-dark text-lg">Alur Penebusan di Kios:</p>
                  <ol className="list-decimal pl-6 space-y-1.5">
                    <li>Datang langsung ke kios resmi (pengecer) di desa/kecamatan Anda.</li>
                    <li>Bawa <strong>KTP asli</strong> dan uang tunai sesuai HET resmi pemerintah (Kartu Tani tidak wajib).</li>
                    <li>Kios mencatat transaksi penebusan melalui aplikasi resmi i-Pubers. <strong>Wajib minta nota/struk</strong>.</li>
                    <li>Jika ada penolakan, harga dinaikkan di atas HET, atau dipaksa membeli paket pupuk non-subsidi, <button onClick={() => setActivePage('report')} className="underline font-bold text-gov-dark hover:text-gov-emerald">segera buat laporan di sini</button>.</li>
                  </ol>
                </div>
              )}

              {(verdict === 'daftar' || rdkk === 'ragu') && verdict !== 'tidak' && (
                <div className="text-base text-slate-800 space-y-2 pt-2 border-t border-gov-pink/25">
                  <p className="font-bold text-gov-dark flex items-center gap-2 text-lg"><ClipboardList className="w-5 h-5 text-gov-forest" />Langkah Mendaftar Secara Resmi:</p>
                  <ol className="list-decimal pl-6 space-y-1.5">
                    <li>Bergabung ke kelompok tani (Poktan) di desa Anda (hubungi ketua poktan atau kantor desa).</li>
                    <li>Serahkan data ke ketua poktan atau penyuluh (PPL): nama sesuai KTP, NIK, luas lahan garapan, jenis komoditas, dan jadwal rencana tanam. Data diserahkan ke penyuluh, <strong>bukan ke PEPUK</strong>.</li>
                    <li>Penyuluh dan Dinas Pertanian memasukkan dan memverifikasi data ke sistem e-RDKK kementerian, lalu disahkan resmi oleh Kepala Dinas Pertanian.</li>
                    <li>Setelah disahkan, cek berkala nama Anda di portal Cek Subsidi Kementan, lalu tebus pupuk di kios resmi dengan membawa KTP.</li>
                  </ol>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Kolom Kanan: Panel Informasi Syarat, Alur, & Bantuan (Sticky) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-[96px]">
          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-gov-dark">Syarat penerima menurut aturan</h2>
            <ul className="text-sm sm:text-base text-slate-700 list-disc pl-5 space-y-2 leading-relaxed">
              <li><strong>10 Komoditas Terpilih:</strong> {ALL.join(', ')}.</li>
              <li><strong>Batas Luas Lahan:</strong> Maksimal 2 hektare setiap musim tanam.</li>
              <li><strong>Keanggotaan:</strong> Terdaftar dalam kelompok tani (Poktan) dan masuk basis data e-RDKK (SIMLUHTAN).</li>
              <li><strong>Dokumen:</strong> Penebusan cukup menggunakan KTP asli di kios resmi dengan harga HET tunai.</li>
            </ul>
            <a href="https://pupukbersubsidi.pertanian.go.id/ceksubsidi/search" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors shadow-sm mt-2">
              Buka Cek Subsidi Kementan <ExternalLink className="w-4 h-4" />
            </a>
          </section>

          <section className="bg-white border border-white rounded-[24px] p-6 sm:p-7 space-y-3.5 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-gov-dark flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gov-emerald" />
              Butuh bantuan pendaftaran?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pendaftaran e-RDKK dilakukan oleh petugas penyuluh lapangan (PPL). Kunjungi Balai Penyuluhan Pertanian (BPP) kecamatan atau kantor desa untuk bertemu PPL setempat.
            </p>
            <div className="pt-3 border-t border-gov-light">
              <p className="text-xs font-semibold text-slate-500 uppercase font-accent mb-1.5">Dasar Hukum Regulasi:</p>
              <ul className="text-xs sm:text-sm space-y-1.5">
                {SOURCES.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gov-forest hover:underline flex items-start gap-1.5">
                      <span>{s.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
