import React from 'react';
import { LayoutDashboard, Send, Search, BookmarkCheck, ClipboardCheck } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ activePage, setActivePage, myReportsCount = 0 }) {
  const navTabs = [
    { id: 'home', label: 'PetaData', icon: LayoutDashboard },
    { id: 'eligibility', label: 'Daftar Subsidi', icon: ClipboardCheck },
    { id: 'track', label: 'Cek Laporan', icon: Search },
    { id: 'my-reports', label: 'Laporan Saya', icon: BookmarkCheck, badge: myReportsCount },
    { id: 'report', label: 'Buat Laporan', icon: Send, isAction: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gov-light">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="h-[76px] flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            aria-label="Kembali ke PetaData PetaPuk"
          >
            <Logo size="md" className="transition-transform group-hover:-translate-y-0.5" />
            <span className="hidden xl:block text-xs leading-tight text-slate-500 font-accent max-w-[14rem] border-l border-gov-light pl-3">
              Transparansi alokasi, realisasi &amp; HET pupuk bersubsidi
            </span>
          </button>

          {/* Desktop & Tablet Navigation */}
          <nav
            className="hidden md:flex items-center gap-0.5 lg:gap-1 rounded-full bg-gov-forest p-1 lg:p-1.5 shadow-sm shrink-0"
            aria-label="Navigasi Utama"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePage === tab.id;

              if (tab.isAction) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePage(tab.id)}
                    className="ml-0.5 lg:ml-1 inline-flex items-center gap-1.5 rounded-full bg-gov-bright px-3.5 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-bold text-gov-dark transition-colors hover:bg-gov-soft font-accent min-h-[38px] lg:min-h-[42px] shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-1 lg:gap-1.5 rounded-full px-2.5 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium transition-colors min-h-[38px] lg:min-h-[42px] shrink-0 ${
                    isActive
                      ? 'bg-gov-soft text-gov-dark font-bold shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-gov-dark' : 'text-gov-soft'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-gov-pink px-1.5 py-0.5 text-[10px] lg:text-xs font-bold leading-none text-gov-dark font-accent">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gov-light px-2 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-6px_24px_-12px_rgba(19,65,24,0.35)]"
        aria-label="Navigasi Seluler"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto text-center">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 px-1 flex flex-col items-center justify-center min-h-[52px] rounded-xl transition-colors ${
                  isActive
                    ? 'text-gov-dark font-bold bg-gov-soft'
                    : 'text-slate-500 hover:text-gov-forest hover:bg-gov-light/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${tab.isAction ? 'text-gov-forest' : ''}`} />
                <span className="text-xs mt-0.5 tracking-tight truncate max-w-[68px] font-accent">
                  {tab.label.split(' ')[0]}
                </span>
                {tab.badge > 0 && (
                  <span className="absolute top-0.5 right-1 w-4 h-4 text-[11px] font-bold text-gov-dark bg-gov-pink rounded-full flex items-center justify-center font-accent">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
