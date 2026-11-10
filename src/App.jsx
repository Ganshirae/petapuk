import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';
import ReportReceipt from './pages/ReportReceipt';
import TrackReport from './pages/TrackReport';
import MyReports from './pages/MyReports';
import Eligibility from './pages/Eligibility';
import OfficerPanel from './pages/OfficerPanel';
import { getMyReports } from './utils/storage';
import { loadReferenceData } from './lib/supabase';

// Halaman petugas tidak ada di menu publik: buka lewat /#petugas
const initialPage = () => (window.location.hash === '#petugas' ? 'officer' : 'home');

export default function App() {
  const [activePage, setActivePage] = useState(initialPage);
  const [prefilledReportData, setPrefilledReportData] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [lookup, setLookup] = useState(null);
  const [myReportsCount, setMyReportsCount] = useState(0);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadReferenceData().then(setData).catch((e) => setLoadError(e.message));
  }, []);

  // Update badge count
  useEffect(() => {
    setMyReportsCount(getMyReports().length);
  }, [activePage]);

  // Scroll to top on page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activePage !== 'report') setPrefilledReportData((p) => (activePage === 'home' ? null : p));
  }, [activePage]);

  const needsData = ['home', 'report'].includes(activePage);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-[#090909]">
      {/* Top Navbar & Mobile Bottom Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        myReportsCount={myReportsCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {needsData && !data && (
          <div className="py-16 text-center text-base text-slate-600" role="status">
            {loadError ? (
              <p className="text-red-700 font-semibold">Gagal memuat data: {loadError}. Periksa koneksi lalu muat ulang halaman.</p>
            ) : 'Memuat data resmi…'}
          </div>
        )}

        {activePage === 'home' && data && (
          <Dashboard
            data={data}
            setActivePage={setActivePage}
            setPrefilledReportData={setPrefilledReportData}
          />
        )}

        {activePage === 'report' && data && (
          <ReportForm
            data={data}
            setActivePage={setActivePage}
            setSubmittedReport={setSubmittedReport}
            prefilledData={prefilledReportData}
          />
        )}

        {activePage === 'receipt' && (
          <ReportReceipt
            report={submittedReport}
            setActivePage={setActivePage}
            setLookupCode={setLookup}
          />
        )}

        {activePage === 'track' && (
          <TrackReport
            initialLookup={lookup}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'my-reports' && (
          <MyReports
            setActivePage={setActivePage}
            setLookupCode={setLookup}
          />
        )}

        {activePage === 'eligibility' && <Eligibility setActivePage={setActivePage} />}

        {activePage === 'officer' && <OfficerPanel />}
      </main>

      {/* Persistent Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
