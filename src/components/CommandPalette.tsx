import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  FilterX,
  RotateCcw,
  Sun,
  Moon,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  X
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';

export const CommandPalette: React.FC = () => {
  const isOpen = useDashboardStore((s) => s.commandPaletteOpen);
  const setIsOpen = useDashboardStore((s) => s.setCommandPaletteOpen);
  const candidates = useDashboardStore((s) => s.candidates);
  const setActivePage = useDashboardStore((s) => s.setActivePage);
  const setSelectedCandidateId = useDashboardStore((s) => s.setSelectedCandidateId);
  const resetAllFilters = useDashboardStore((s) => s.resetAllFilters);
  const toggleDarkMode = useDashboardStore((s) => s.toggleDarkMode);
  const toggleMaskPii = useDashboardStore((s) => s.toggleMaskPii);

  const [query, setQuery] = useState('');

  // Keyboard listener for Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  // Filter candidates matching query
  const matchedCandidates = query.trim()
    ? candidates
        .filter(
          (c) =>
            c.candidate_name.toLowerCase().includes(query.toLowerCase()) ||
            c.position_clean.toLowerCase().includes(query.toLowerCase()) ||
            c.email.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Palette Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-[#E3EAE6] dark:border-[#0E4437] overflow-hidden z-10 flex flex-col"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-[#E3EAE6] dark:border-[#0E4437]">
            <Search className="w-4 h-4 text-text-muted mr-3 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Ketik perintah atau cari nama kandidat... (Esc untuk batal)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-text-heading dark:text-[#E7F5EF] placeholder:text-text-muted focus:outline-hidden"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-text-muted hover:text-text-heading"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results / Commands list */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
            {/* Matched candidates */}
            {matchedCandidates.length > 0 && (
              <div className="pb-2 mb-2 border-b border-[#E3EAE6] dark:border-[#0E4437]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
                  Kandidat Ditemukan
                </div>
                {matchedCandidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      handleAction(() => {
                        setActivePage('kandidat');
                        setSelectedCandidateId(c.id);
                      })
                    }
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#1F7A5C] text-white flex items-center justify-center font-bold text-[10px]">
                        {c.candidate_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{c.candidate_name}</div>
                        <div className="text-[10px] text-text-muted">{c.position_placement}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-green-700 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Navigation Commands */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
              Navigasi Halaman
            </div>

            <button
              onClick={() => handleAction(() => setActivePage('kandidat'))}
              className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] transition-colors"
            >
              <Users className="w-4 h-4 text-green-700" />
              <span>Buka Halaman: Kandidat Lengkap</span>
            </button>

            <button
              onClick={() => handleAction(() => setActivePage('gate'))}
              className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] transition-colors"
            >
              <FilterX className="w-4 h-4 text-[#FF5A1F]" />
              <span>Buka Halaman: Gate Seleksi</span>
            </button>

            {/* Action Commands */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 py-1 pt-2">
              Aksi Cepat
            </div>

            <button
              onClick={() => handleAction(() => resetAllFilters())}
              className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-stat-blue" />
              <span>Reset Semua Filter Global</span>
            </button>

            <button
              onClick={() => handleAction(() => toggleMaskPii())}
              className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] transition-colors"
            >
              <EyeOff className="w-4 h-4 text-amber-600" />
              <span>Toggle Samarkan Data Pribadi (PII)</span>
            </button>

            <button
              onClick={() => handleAction(() => toggleDarkMode())}
              className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] transition-colors"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Toggle Mode Terang / Gelap</span>
            </button>
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2 bg-[#F1F5F2] dark:bg-[#072A22] border-t border-[#E3EAE6] dark:border-[#0E4437] text-[11px] text-text-muted flex items-center justify-between">
            <span>Gunakan panah & enter untuk memilih</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-[#E3EAE6] dark:border-[#0E4437] text-[10px]">
              Esc tutup
            </kbd>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
