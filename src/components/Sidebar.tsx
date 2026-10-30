import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FilterX,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UploadCloud,
  RefreshCw,
  ShieldCheck,
  CalendarCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { PageView } from '../types';

export const Sidebar: React.FC = () => {
  const activePage = useDashboardStore((s) => s.activePage);
  const setActivePage = useDashboardStore((s) => s.setActivePage);
  const sidebarCollapsed = useDashboardStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);
  const lastUpdated = useDashboardStore((s) => s.lastUpdated);
  const fileName = useDashboardStore((s) => s.fileName);
  const initializeData = useDashboardStore((s) => s.initializeData);
  const uploadExcel = useDashboardStore((s) => s.uploadExcel);
  const addToast = useDashboardStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems: { id: PageView; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'kandidat',
      label: 'Kandidat Lengkap',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'gate',
      label: 'Gate Seleksi',
      icon: <FilterX className="w-5 h-5" />,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadExcel(file);
    }
  };

  const handleLogout = () => {
    addToast('Sesi dashboard ditutup. Terima kasih!', 'info');
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 76 : 260,
        transition: { duration: 0.25, ease: 'easeInOut' },
      }}
      className="relative z-30 flex flex-col h-screen shrink-0 bg-[#05473A] text-white border-r border-[#0B5D48] select-none"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#0B5D48]/70">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1F7A5C] text-white font-black text-lg shadow-inner shrink-0">
            HC
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="text-base font-extrabold tracking-tight text-white leading-tight">
                  Human Capital
                </div>
                <div className="text-[11px] text-[#3E8F74] font-medium tracking-wide">
                  Recruitment PIC System
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#3E8F74]">
            Menu Utama
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-[#0B5D48] text-white shadow-sm border border-[#1F7A5C]/50'
                  : 'text-[#E3EAE6]/80 hover:bg-[#07362C] hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-[#3E8F74]' : ''}`}>
                {item.icon}
              </span>

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Excel Data Info Card (if expanded) */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-[#043329] border border-[#0B5D48]/60 text-xs">
          <div className="flex items-center justify-between text-[#82A796] mb-1">
            <span className="flex items-center space-x-1 font-semibold truncate text-[11px]">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1F7A5C] shrink-0" />
              <span className="truncate max-w-[130px]">{fileName}</span>
            </span>
            <button
              onClick={() => initializeData()}
              className="p-1 hover:text-white text-[#3E8F74] transition-colors"
              title="Muat ulang file awal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-[#3E8F74] mb-2">
            Diperbarui:{' '}
            {lastUpdated ? lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 px-2 bg-[#0B5D48] hover:bg-[#1F7A5C] text-white rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors border border-[#1F7A5C]/40"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Unggah Excel Baru</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-[#0B5D48]/70 space-y-2">
        {/* Toggle Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#043329] hover:bg-[#07362C] text-[#E3EAE6] text-xs font-semibold transition-colors"
          title={sidebarCollapsed ? 'Perluas Menu' : 'Sembunyikan Menu'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Sembunyikan Menu</span>
            </>
          )}
        </button>

        {/* Orange Keluar Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-[#FF5A1F] hover:bg-[#e04e17] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Keluar"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </motion.aside>
  );
};
