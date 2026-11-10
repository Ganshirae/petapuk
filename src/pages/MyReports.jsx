import React, { useState } from 'react';
import { getMyReports, clearMyReports } from '../utils/storage';
import { REPORT_CATEGORIES } from '../data/ntbData';
import { Search, Trash2, FileText } from 'lucide-react';

export default function MyReports({ setActivePage, setLookupCode }) {
  const [list, setList] = useState(getMyReports);

  const handleClear = () => {
    if (window.confirm('Hapus semua ID dan kode rahasia dari perangkat ini? Kode tidak bisa dipulihkan setelah dihapus.')) {
      clearMyReports();
      setList([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="bg-gov-light border border-gov-border p-6 sm:p-7 rounded-[22px] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gov-dark tracking-tight">Laporan Saya</h1>
          {list.length > 0 && (
            <button onClick={handleClear} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold text-red-700 border border-red-300 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />Hapus dari perangkat
            </button>
          )}
        </div>
        <p className="text-base text-slate-600">Disimpan hanya di peramban perangkat ini, bukan di server. Jika memakai HP bersama, hapus setelah dicatat.</p>
      </header>

      {list.length === 0 ? (
        <div className="bg-white border border-gov-light rounded-[22px] p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base text-slate-600">Belum ada laporan dari perangkat ini.</p>
          <button onClick={() => setActivePage('report')} className="px-5 py-3 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-base font-bold transition-colors">Buat laporan</button>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item.publicId} className="bg-white border border-gov-light rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-accent text-lg font-bold text-gov-dark">{item.publicId}</p>
                <p className="text-sm font-medium text-slate-700">{REPORT_CATEGORIES.find((c) => c.id === item.category)?.title} • {item.regionName}</p>
                <p className="text-xs text-slate-500">Kode: <span className="font-accent font-bold text-sm text-gov-dark">{item.secretCode}</span> • {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
              </div>
              <button
                onClick={() => { setLookupCode({ publicId: item.publicId, secretCode: item.secretCode }); setActivePage('track'); }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gov-forest hover:bg-gov-hover text-white text-sm font-bold transition-colors min-h-[42px]"
              >
                <Search className="w-4 h-4" />Lacak
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
