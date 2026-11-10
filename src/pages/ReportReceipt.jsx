import React, { useState } from 'react';
import { Check, Copy, AlertTriangle, Search, ShieldCheck, Printer, ExternalLink, ArrowRight, Info, Share2 } from 'lucide-react';
import { REPORT_CATEGORIES, OFFICIAL_CHANNELS } from '../data/ntbData';

const dt = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function ReportReceipt({ report, setActivePage, setLookupCode }) {
  const [copied, setCopied] = useState('');

  if (!report) {
    return (
      <div className="rounded-[28px] bg-gov-pale p-6 sm:p-12 text-center max-w-2xl mx-auto space-y-5 my-8">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
          <Info className="w-8 h-8 text-gov-forest" />
        </div>
        <h2 className="text-2xl font-bold text-gov-dark">Tidak ada tanda terima di sesi ini</h2>
        <p className="text-base text-slate-600">
          Tanda terima laporan hanya tampil sesaat setelah Anda mengirim laporan baru, atau dapat diakses kembali melalui menu Laporan Saya jika tersimpan di peramban ini.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => setActivePage('report')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px]"
          >
            Buat Laporan Baru
          </button>
          <button
            onClick={() => setActivePage('track')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-gov-forest text-gov-dark text-base font-bold hover:bg-gov-light transition-colors min-h-[48px]"
          >
            Cek Status Laporan
          </button>
        </div>
      </div>
    );
  }

  const copy = async (key, text) => {
    await navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const s = report.summary || {};
  const categoryTitle = REPORT_CATEGORIES.find((c) => c.id === report.category)?.title || report.category;
  const forwardText = [
    `*PENGADUAN PUPUK BERSUBSIDI (Ref. PEPUK ${report.publicId})*`,
    `Masalah: ${categoryTitle}`,
    report.fertilizerName && `Pupuk: ${report.fertilizerName}`,
    `Lokasi: ${[s.desa, s.kecamatan, report.regionName].filter(Boolean).join(', ')}`,
    `Tanggal kejadian: ${s.incidentDate || '–'}`,
    s.kioskName && `Kios: ${s.kioskName}`,
    Number(s.pricePaidPerKg) > 0 && `Harga dibayar: Rp${Number(s.pricePaidPerKg).toLocaleString('id-ID')}/kg${s.hetPerKg ? ` (HET resmi Rp${s.hetPerKg.toLocaleString('id-ID')}/kg)` : ''}`,
    `Kronologi: ${s.description || '–'}`
  ].filter(Boolean).join('\n');

  const CopyBtn = ({ k, text, label, primary = false }) => (
    <button
      onClick={() => copy(k, text)}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors min-h-[44px] ${
        primary
          ? 'bg-gov-dark text-white border-gov-dark hover:bg-gov-forest'
          : 'border-gov-border bg-white text-gov-dark hover:border-gov-emerald hover:bg-gov-light'
      }`}
    >
      {copied === k ? <Check className="w-4 h-4 text-gov-forest" /> : <Copy className="w-4 h-4" />}
      <span>{copied === k ? 'Tersalin ke Klipbor!' : label}</span>
    </button>
  );

  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-7">
      {/* Header Banner */}
      <header className="bg-white border border-white p-5 sm:p-8 rounded-[20px] sm:rounded-[24px] shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-gov-light rounded-2xl shrink-0 mt-0.5 sm:mt-1">
            <ShieldCheck className="w-7 h-7 sm:w-10 sm:h-10 text-gov-forest" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-3xl font-bold text-gov-dark tracking-tight">
              Tanda Terima Laporan
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Laporan telah resmi tercatat di sistem pada <strong>{dt(report.createdAt)}</strong>
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gov-light border border-gov-border text-xs sm:text-sm font-bold text-gov-dark self-start md:self-auto">
          <span>Tenggat Verifikasi Petugas:</span>
          <span className="text-gov-forest font-accent">{dt(report.dueAt)}</span>
        </div>
      </header>

      {/* Grid 2-Kolom: Tanda Terima & Akses Kiri + Panduan Teruskan Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Kolom Kiri: Nomor ID, Kode Rahasia, Peringatan & Tombol Utama */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-6">
          <div className="bg-white border-2 border-gov-dark rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-sm">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-gov-light text-gov-forest text-xs font-bold font-accent uppercase tracking-wider mb-2">
                Simpan Informasi Ini Baik-Baik
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gov-dark">
                Akses Pemantauan Laporan Anda
              </h2>
              <p className="text-base text-slate-600 mt-1">
                Gunakan ID Laporan dan Kode Rahasia di bawah ini untuk memeriksa perkembangan tindak lanjut petugas di masa mendatang.
              </p>
            </div>

            {/* Kotak ID Laporan & Kode Rahasia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-gov-border bg-gov-light/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-accent font-bold text-slate-600 uppercase tracking-wider">
                    ID Laporan (Boleh Dibagikan)
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-gov-border">Publik</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-accent tracking-wider text-gov-dark select-all">
                  {report.publicId}
                </p>
                <CopyBtn k="id" text={report.publicId} label="Salin ID Laporan" />
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border-2 border-gov-pink bg-[#FFF5F9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-accent font-bold text-red-900 uppercase tracking-wider">
                    Kode Rahasia (Jangan Dibagikan)
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gov-pink/20 text-red-900 border border-gov-pink">Pribadi</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-accent tracking-wider text-gov-dark select-all">
                  {report.secretCode}
                </p>
                <CopyBtn k="code" text={report.secretCode} label="Salin Kode Rahasia" />
              </div>
            </div>

            {/* Peringatan Keamanan Kode */}
            <div className="flex items-start gap-3.5 text-base text-gov-dark bg-[#FFF5F9] border-2 border-gov-pink/60 rounded-2xl p-4 sm:p-5 leading-relaxed">
              <AlertTriangle className="w-6 h-6 shrink-0 text-gov-pink mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold text-red-950">Catat atau foto layar ini dengan kamera HP Anda sekarang!</strong>
                <p className="text-sm sm:text-base text-slate-700">
                  Demi perlindungan privasi pelapor, server hanya menyimpan kode rahasia dalam bentuk enkripsi satu arah. Jika kode hilang, petugas tidak dapat memulihkannya.
                </p>
              </div>
            </div>

            {/* Tombol Tindakan Utama */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  setLookupCode?.({ publicId: report.publicId, secretCode: report.secretCode });
                  setActivePage('track');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px] shadow-sm"
              >
                <Search className="w-5 h-5" />
                <span>Lacak Status Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border-2 border-gov-border text-gov-dark text-base font-bold hover:bg-gov-light transition-colors min-h-[48px] print:hidden"
              >
                <Printer className="w-5 h-5 text-slate-600" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>

          {/* Rincian Singkat Laporan yang Diserahkan */}
          <div className="bg-white border border-gov-light rounded-[24px] p-6 sm:p-7 space-y-4">
            <h3 className="text-lg font-bold text-gov-dark border-b border-gov-light pb-3">
              Ringkasan Data yang Anda Laporkan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Kategori Pelanggaran</span>
                <span className="font-bold text-gov-dark">{categoryTitle}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Wilayah Administratif</span>
                <span className="font-bold text-gov-dark">{[s.desa, s.kecamatan, report.regionName].filter(Boolean).join(', ') || '–'}</span>
              </div>
              {report.fertilizerName && (
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Jenis Pupuk</span>
                  <span className="font-bold text-gov-dark">{report.fertilizerName}</span>
                </div>
              )}
              {s.kioskName && (
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Nama Kios</span>
                  <span className="font-bold text-gov-dark">{s.kioskName}</span>
                </div>
              )}
              {Number(s.pricePaidPerKg) > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Harga Tebus</span>
                  <span className="font-bold text-red-700">Rp{Number(s.pricePaidPerKg).toLocaleString('id-ID')}/kg</span>
                </div>
              )}
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Tanggal Kejadian</span>
                <span className="font-bold text-gov-dark">{s.incidentDate || '–'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kolom Kanan: Meneruskan ke Kanal Resmi & Alur Kerja Petugas */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-[96px] print:hidden">
          {/* Card Teruskan ke Kanal Resmi */}
          <div className="bg-white border border-gov-border rounded-[24px] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-gov-forest shrink-0" />
              <h3 className="text-lg font-bold text-gov-dark">
                Teruskan ke Kanal Resmi
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda bisa menyalin ringkasan format pengaduan ini (sudah dibersihkan dari nomor kontak pribadi) untuk ditempel langsung di WhatsApp kelompok tani, penyuluh PPL, atau kanal pengawas:
            </p>

            <CopyBtn k="fwd" text={forwardText} label="Salin Ringkasan untuk WhatsApp" primary />

            <div className="pt-2 border-t border-gov-light space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Kanal Pengaduan Eksternal
              </span>
              <ul className="space-y-2.5">
                {OFFICIAL_CHANNELS.slice(0, 3).map((c) => (
                  <li key={c.name}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 p-3.5 border border-gov-light rounded-xl hover:border-gov-border hover:bg-gov-light/40 text-sm transition-colors group"
                    >
                      <div>
                        <strong className="block text-gov-dark group-hover:text-gov-forest transition-colors">
                          {c.name}
                        </strong>
                        <span className="text-slate-500 text-xs">{c.detail}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-gov-forest" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card Prosedur Verifikasi */}
          <div className="bg-white border border-gov-light rounded-[24px] p-6 space-y-3.5">
            <h4 className="text-base font-bold text-gov-dark">
              Apa yang Terjadi Setelah Ini?
            </h4>
            <ol className="text-sm text-slate-600 space-y-2.5 list-decimal pl-4 leading-relaxed">
              <li>
                <strong>Verifikasi 3 Hari Kerja:</strong> Petugas dinas meninjau kronologi dan keaslian bukti yang Anda lampirkan.
              </li>
              <li>
                <strong>Pemeriksaan Lapangan:</strong> Jika terindikasi pelanggaran kios/distributor, tim pengawas turun ke lapangan.
              </li>
              <li>
                <strong>Hak Konfirmasi Pelapor:</strong> Setelah instansi menyatakan selesai, Anda memiliki hak selama 10 hari untuk mengonfirmasi apakah masalah sudah benar-benar terselesaikan di lapangan.
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
