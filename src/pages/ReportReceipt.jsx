import React, { useState } from 'react';
import { Check, Copy, AlertTriangle, Search, ShieldCheck, Printer, ExternalLink } from 'lucide-react';
import { REPORT_CATEGORIES, OFFICIAL_CHANNELS } from '../data/ntbData';

const dt = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function ReportReceipt({ report, setActivePage, setLookupCode }) {
  const [copied, setCopied] = useState('');

  if (!report) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4 text-sm text-slate-600">
        <p>Tidak ada tanda terima di sesi ini.</p>
        <button onClick={() => setActivePage('report')} className="px-4 py-2 rounded bg-gov-forest text-white font-bold">Buat laporan</button>
      </div>
    );
  }

  const copy = async (key, text) => {
    await navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const s = report.summary;
  const forwardText = [
    `Pengaduan pupuk bersubsidi (ref. PEPUK ${report.publicId})`,
    `Masalah: ${REPORT_CATEGORIES.find((c) => c.id === report.category)?.title}`,
    report.fertilizerName && `Pupuk: ${report.fertilizerName}`,
    `Lokasi: ${[s.desa, s.kecamatan, report.regionName].filter(Boolean).join(', ')}`,
    `Tanggal: ${s.incidentDate}`,
    s.kioskName && `Kios: ${s.kioskName}`,
    Number(s.pricePaidPerKg) > 0 && `Harga dibayar: Rp${Number(s.pricePaidPerKg).toLocaleString('id-ID')}/kg${s.hetPerKg ? ` (HET Rp${s.hetPerKg.toLocaleString('id-ID')}/kg)` : ''}`,
    `Kronologi: ${s.description}`
  ].filter(Boolean).join('\n');

  const CopyBtn = ({ k, text, label }) => (
    <button onClick={() => copy(k, text)} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gov-border hover:border-gov-emerald hover:bg-gov-light text-gov-dark text-sm font-bold transition-colors min-h-[42px]">
      {copied === k ? <Check className="w-4 h-4 text-gov-forest" /> : <Copy className="w-4 h-4" />}{copied === k ? 'Tersalin' : label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="bg-white border-2 border-gov-dark rounded-[22px] p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="w-9 h-9 text-gov-forest shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-gov-dark">Laporan terkirim</h1>
            <p className="text-base text-slate-600 mt-1">Dicatat {dt(report.createdAt)}. Petugas wajib memverifikasi paling lambat <strong>{dt(report.dueAt)}</strong> (3 hari kerja).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-gov-border bg-gov-light/40 space-y-2.5">
            <p className="text-xs font-accent font-semibold text-slate-600 uppercase tracking-wider">ID laporan (boleh dibagikan)</p>
            <p className="text-2xl font-bold font-accent tracking-wider text-gov-dark">{report.publicId}</p>
            <CopyBtn k="id" text={report.publicId} label="Salin ID" />
          </div>
          <div className="p-5 rounded-2xl border-2 border-gov-pink bg-[#FFF5F9] space-y-2.5">
            <p className="text-xs font-accent font-semibold text-gov-dark uppercase tracking-wider">Kode rahasia (jangan dibagikan)</p>
            <p className="text-2xl font-bold font-accent tracking-wider text-gov-dark">{report.secretCode}</p>
            <CopyBtn k="code" text={report.secretCode} label="Salin kode" />
          </div>
        </div>

        <p className="flex gap-2.5 text-sm text-gov-dark bg-[#FFF5F9] border border-gov-pink/50 rounded-xl p-4 leading-relaxed">
          <AlertTriangle className="w-5 h-5 shrink-0 text-gov-pink mt-0.5" />
          <span>Catat atau foto layar ini. Kode rahasia <strong>tidak bisa dipulihkan</strong> karena server hanya menyimpan versi terenkripsinya. Kode juga tersimpan di menu "Laporan Saya" pada perangkat ini.</span>
        </p>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setLookupCode?.({ publicId: report.publicId, secretCode: report.secretCode }); setActivePage('track'); }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px]">
            <Search className="w-4 h-4" />Lacak sekarang
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gov-border text-gov-dark text-base font-bold hover:bg-gov-light transition-colors min-h-[48px]">
            <Printer className="w-4 h-4" />Cetak / simpan PDF
          </button>
        </div>
      </section>

      <section className="bg-white border border-gov-light rounded-[22px] p-6 space-y-4 print:hidden">
        <h2 className="text-lg font-bold text-gov-dark">Ingin melapor juga ke kanal resmi?</h2>
        <p className="text-sm text-slate-600">Salin ringkasan laporan (tanpa kontak Anda) lalu tempel di kanal berikut.</p>
        <CopyBtn k="fwd" text={forwardText} label="Salin ringkasan laporan" />
        <ul className="grid sm:grid-cols-2 gap-3">
          {OFFICIAL_CHANNELS.slice(0, 3).map((c) => (
            <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 p-3.5 border border-gov-light rounded-xl hover:border-gov-border hover:bg-gov-light/40 text-sm transition-colors"><span><strong className="block text-gov-dark">{c.name}</strong><span className="text-slate-600 text-xs">{c.detail}</span></span><ExternalLink className="w-4 h-4 shrink-0 text-slate-400" /></a></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
