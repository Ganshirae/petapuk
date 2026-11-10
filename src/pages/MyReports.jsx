import React, { useState } from 'react';
import { getMyReports, clearMyReports } from '../utils/storage';
import { REPORT_CATEGORIES } from '../data/ntbData';
import { Search, Trash2, FileText, ShieldAlert, ArrowRight, PlusCircle, Copy, Check } from 'lucide-react';

export default function MyReports({ setActivePage, setLookupCode }) {
  const [list, setList] = useState(getMyReports);
  const [copiedCode, setCopiedCode] = useState('');

  const handleClear = () => {
    if (
      window.confirm(
        'PERINGATAN: Hapus semua riwayat ID dan kode rahasia dari perangkat ini?\n\nPastikan Anda sudah mencatat nomor ID dan Kode Rahasia di tempat aman (kertas atau WhatsApp). Kode tidak bisa dipulihkan kembali setelah dihapus.'
      )
    ) {
      clearMyReports();
      setList([]);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-gov-pale p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-5 sm:space-y-7">
      {/* Header Banner */}
      <header className="bg-white border border-white p-5 sm:p-8 rounded-[20px] sm:rounded-[24px] shadow-[0_20px_40px_-36px_rgba(19,65,24,0.55)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-bold text-gov-dark tracking-tight">
            Laporan Saya di Perangkat Ini
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Daftar pengaduan yang dibuat melalui peramban ini. Disimpan secara lokal di memori HP/komputer Anda, bukan di server publik.
          </p>
        </div>

        {list.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors self-start md:self-auto min-h-[42px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Riwayat Perangkat</span>
          </button>
        )}
      </header>

      {/* Grid 2-Kolom: Daftar Laporan Kiri + Panduan Keamanan & Akses Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Kolom Kiri: List Laporan atau Empty State */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-4">
          {list.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gov-border rounded-[20px] sm:rounded-[24px] p-6 sm:p-12 text-center space-y-4 sm:space-y-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gov-light flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-gov-forest" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-gov-dark">Belum ada laporan dari perangkat ini</h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                  Jika Anda baru pertama kali melapor atau membuka situs ini di perangkat baru, riwayat pengaduan masih kosong.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActivePage('report')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors min-h-[48px] shadow-sm"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Buat Laporan Pengaduan Baru</span>
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-3.5 sm:space-y-4">
              {list.map((item) => {
                const category = REPORT_CATEGORIES.find((c) => c.id === item.category);
                const isCopied = copiedCode === item.secretCode;

                return (
                  <li
                    key={item.publicId}
                    className="bg-white border border-gov-light rounded-[20px] sm:rounded-[22px] p-4 sm:p-6 shadow-sm hover:border-gov-emerald transition-all space-y-3.5 sm:space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-accent text-xl sm:text-2xl font-bold text-gov-dark tracking-wide">
                            {item.publicId}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gov-light text-gov-dark border border-gov-border">
                            {item.regionName || 'Wilayah NTB'}
                          </span>
                        </div>
                        <p className="text-base font-medium text-slate-800">
                          {category?.title || 'Pengaduan Pupuk'}
                        </p>
                      </div>

                      <span className="text-xs text-slate-500 font-medium">
                        Diajukan: {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    {/* Informasi Kode Rahasia */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gov-pale border border-gov-border/60 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-medium">Kode Rahasia:</span>
                        <code className="font-accent font-bold text-base text-gov-dark bg-white px-2 py-0.5 rounded border border-gov-border">
                          {item.secretCode}
                        </code>
                      </div>
                      <button
                        onClick={() => handleCopy(item.secretCode)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gov-forest hover:text-gov-hover px-2.5 py-1 rounded bg-white border border-gov-border transition-colors"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-gov-forest" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin' : 'Salin Kode'}</span>
                      </button>
                    </div>

                    {/* Tombol Lacak */}
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setLookupCode({ publicId: item.publicId, secretCode: item.secretCode });
                          setActivePage('track');
                        }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-sm sm:text-base font-bold transition-colors min-h-[44px] w-full sm:w-auto"
                      >
                        <Search className="w-4 h-4" />
                        <span>Lacak Status Pengaduan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Kolom Kanan: Panduan Keamanan & Tindakan Cepat */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-[96px]">
          {/* Card Panduan HP Bersama */}
          <div className="bg-white border border-gov-border rounded-[24px] p-6 space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gov-pink/20 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6 text-gov-pink" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gov-dark">
                  Keamanan di Perangkat Bersama
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Penting Bagi Pelapor
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Jika Anda memakai HP milik keluarga, tetangga, atau komputer di kantor desa, siapa pun yang membuka peramban ini bisa melihat nomor ID dan kode rahasia Anda.
            </p>

            <div className="bg-gov-light/50 p-4 rounded-xl border border-gov-border space-y-2 text-sm text-gov-dark">
              <strong>Tips Aman:</strong>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-xs sm:text-sm">
                <li>Catat ID dan Kode Rahasia ke kertas atau pesan pribadi.</li>
                <li>Gunakan tombol <em>"Hapus Riwayat Perangkat"</em> di bagian atas setelah selesai.</li>
              </ol>
            </div>
          </div>

          {/* Card Tindakan Alternatif */}
          <div className="bg-white border border-gov-light rounded-[24px] p-6 space-y-4">
            <h4 className="text-base font-bold text-gov-dark">
              Menu Pengaduan Lainnya
            </h4>

            <div className="space-y-2.5">
              <button
                onClick={() => setActivePage('track')}
                className="w-full inline-flex items-center justify-between p-3.5 rounded-xl border border-gov-light hover:border-gov-border hover:bg-gov-light/40 text-sm font-bold text-gov-dark transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gov-forest" />
                  <span>Lacak dengan ID Lain</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-forest" />
              </button>

              <button
                onClick={() => setActivePage('report')}
                className="w-full inline-flex items-center justify-between p-3.5 rounded-xl border border-gov-light hover:border-gov-border hover:bg-gov-light/40 text-sm font-bold text-gov-dark transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-gov-forest" />
                  <span>Buat Laporan Baru</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-forest" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
