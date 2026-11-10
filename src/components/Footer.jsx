import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Logo from './Logo';

export default function Footer({ setActivePage }) {
  return (
    <footer className="mt-16 px-4 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto rounded-[26px] bg-gradient-to-r from-gov-bright via-gov-soft to-white border border-gov-light p-8 sm:p-10 text-gov-dark">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.25fr] gap-8 md:gap-10">
          <div className="space-y-3">
            <Logo size="lg" />
            <p className="text-sm leading-relaxed max-w-sm text-gov-dark/80">
              Tempat petani mengecek harga resmi dan jatah pupuk subsidi, serta melapor bila ada yang tidak sesuai.
            </p>
            <p className="text-xs leading-relaxed text-gov-dark/60 font-accent max-w-sm">
              Portal independen, bukan situs resmi pemerintah. Data: Kementerian Pertanian (38 provinsi) dan Satu Data NTB (10 kabupaten/kota).
            </p>
          </div>

          <nav aria-label="Navigasi footer" className="font-accent">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gov-dark/60 mb-3">Navigasi</h2>
            <ul className="space-y-2.5 text-sm">
              {[
                ['home', 'PetaData'],
                ['eligibility', 'Daftar Subsidi'],
                ['report', 'Buat Laporan'],
                ['track', 'Cek Laporan']
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => setActivePage(id)}
                    className="text-gov-dark/80 hover:text-gov-dark hover:underline underline-offset-4 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-gov-emerald" />
              <div>
                <h2 className="text-base font-bold">Privasi Anda</h2>
                <p className="text-sm leading-relaxed text-gov-dark/75 mt-1">
                  Tidak perlu akun, nomor KTP, atau nama asli. Nomor HP hanya diisi kalau Anda mau dihubungi.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white/55 border border-gov-dark/10 p-3.5 text-xs leading-relaxed text-gov-dark/70 font-accent">
              Data kosong ditampilkan sebagai <strong className="text-gov-dark">“–”</strong> atau abu-abu, bukan nol. Platform ini tidak memproses penebusan atau pendaftaran e-RDKK.
            </div>
          </div>
        </div>

        <div className="border-t border-gov-dark/15 mt-7 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-accent text-gov-dark/65">
          <span>© {new Date().getFullYear()} PetaPuk. Karya untuk kompetisi MIA 2026 (Web in Action).</span>
          <span className="text-gov-dark/80 font-semibold">Designing Digital Futures: Powering Public Transparency</span>
        </div>
      </div>
    </footer>
  );
}
