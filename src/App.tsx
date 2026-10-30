import React, { useEffect, useState } from 'react';
import { useDashboardStore } from './store/useDashboardStore';
import { Sidebar } from './components/Sidebar';
import { GlobalFilterBar } from './components/GlobalFilterBar';
import { KandidatPage } from './pages/KandidatPage';
import { GatePage } from './pages/GatePage';
import { ToastContainer } from './components/ToastContainer';
import { CommandPalette } from './components/CommandPalette';
import { UploadCloud, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const activePage = useDashboardStore((s) => s.activePage);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const initializeData = useDashboardStore((s) => s.initializeData);
  const uploadExcel = useDashboardStore((s) => s.uploadExcel);

  // Drag and drop state over window
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Global keyboard shortcuts: `/` to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Drag & Drop listener for Excel files
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX <= 0 || e.clientY <= 0) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls') ||
          file.name.endsWith('.csv')
        ) {
          uploadExcel(file);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadExcel]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-page text-text-heading font-sans transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Compact Sticky Filter Bar */}
        <GlobalFilterBar />

        {/* Main Viewport Container (NO page scrollbar) */}
        <main className="flex-1 min-h-0 flex flex-col px-2.5 lg:px-4 py-1.5 overflow-hidden">
          {/* Compact Header Title */}
          <div className="flex items-center justify-between pb-1 shrink-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-sm lg:text-base font-black text-[#04281F] dark:text-[#E7F5EF] tracking-tight leading-none m-0">
                Dashboard Human Capital
              </h1>
              <span className="text-[10px] font-medium text-[#4B6358] dark:text-[#82A796] hidden md:inline-block">
                • Pipeline rekrutmen, jadwal interview, & evaluasi gate seleksi
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="flex-1 min-h-0 flex flex-col space-y-3 animate-pulse">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-[#E3EAE6] dark:bg-[#0A382E]" />
                ))}
              </div>
              <div className="flex-1 rounded-xl bg-[#E3EAE6] dark:bg-[#0A382E]" />
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl bg-surface border border-red-200 dark:border-red-900/60 shadow-xs text-center space-y-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-heading dark:text-white">
                  Gagal Membaca File Excel
                </h3>
                <p className="text-xs text-text-muted mt-1">{error}</p>
              </div>
              <button
                onClick={() => initializeData()}
                className="px-3 py-1.5 bg-[#1F7A5C] hover:bg-[#18644b] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          ) : (
            /* Active Page Render */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {activePage === 'kandidat' ? <KandidatPage /> : <GatePage />}
            </div>
          )}
        </main>
      </div>

      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-[#05473A]/85 backdrop-blur-md flex flex-col items-center justify-center text-white border-4 border-dashed border-[#FF5A1F] m-4 rounded-3xl animate-pulse">
          <UploadCloud className="w-16 h-16 text-[#FF5A1F] mb-3" />
          <h2 className="text-xl font-black tracking-tight">Lepaskan File Excel di Sini</h2>
          <p className="text-xs text-[#E3EAE6] mt-1">
            Format .xlsx, .xls untuk memperbarui data dashboard seketika
          </p>
        </div>
      )}

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}

export default App;
