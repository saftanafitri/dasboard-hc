import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FilterX, Mail, User, Briefcase, Calendar, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { GateCandidate } from '../../types';
import { maskEmail } from '../../lib/transformers';

interface GateDrawerProps {
  gateCandidates: GateCandidate[];
}

export const GateDrawer: React.FC<GateDrawerProps> = ({ gateCandidates }) => {
  const selectedGateCandidateId = useDashboardStore((s) => s.selectedGateCandidateId);
  const setSelectedGateCandidateId = useDashboardStore((s) => s.setSelectedGateCandidateId);
  const maskPii = useDashboardStore((s) => s.maskPii);

  const candidate = gateCandidates.find((g) => g.id === selectedGateCandidateId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedGateCandidateId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedGateCandidateId]);

  if (!candidate) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedGateCandidateId(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg h-full bg-surface shadow-drawer border-l border-[#E3EAE6] dark:border-[#0E4437] flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E3EAE6] dark:border-[#0E4437] bg-[#F1F5F2] dark:bg-[#072A22]">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FF5A1F]/10 text-[#FF5A1F]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-text-heading dark:text-white">
                Detail Evaluasi Gate Seleksi
              </span>
            </div>
            <button
              onClick={() => setSelectedGateCandidateId(null)}
              className="p-1.5 rounded-lg hover:bg-[#E3EAE6] dark:hover:bg-[#0E4437] text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identity */}
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center font-black text-xl shrink-0 uppercase shadow-xs">
                {candidate.user_name.charAt(0) || 'K'}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-text-heading dark:text-white">
                  {candidate.user_name}
                </h3>
                <div className="text-xs text-text-muted flex items-center space-x-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{maskPii ? maskEmail(candidate.user_email) : candidate.user_email}</span>
                </div>
                <div className="text-xs font-semibold text-green-700 dark:text-emerald-400 mt-1">
                  {candidate.position_name}
                </div>
              </div>
            </div>

            {/* Failure Comparison Box */}
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                  Kriteria Gate yang Tidak Terpenuhi
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200">
                  Step {candidate.step_number}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-text-muted font-medium">Bidang Pertanyaan / Field</div>
                <div className="text-sm font-bold text-text-heading dark:text-white">
                  {candidate.field_name_label} ({candidate.field_name})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-red-200/60 dark:border-red-900/40 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#072A22] border border-red-300 dark:border-red-800">
                  <div className="text-[10px] text-text-muted font-semibold">Jawaban Kandidat</div>
                  <div className="font-extrabold text-red-600 dark:text-red-400 mt-0.5">
                    {candidate.field_value}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#072A22] border border-emerald-300 dark:border-emerald-800">
                  <div className="text-[10px] text-text-muted font-semibold">Syarat Lolos Gate</div>
                  <div className="font-extrabold text-[#059669] dark:text-emerald-400 mt-0.5">
                    {candidate.syarat_lolos_gate || 'Sesuai Standar'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-text-muted flex items-center justify-between pt-1">
                <span>Tipe Aturan: <strong className="text-text-heading dark:text-white">{candidate.aturan_gate_tipe}</strong></span>
                <span>Waktu: {candidate.created_at_formatted}</span>
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="p-4 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] space-y-2 text-xs">
              <span className="font-bold text-text-muted uppercase text-[10px]">
                ID & Konfigurasi Sistem
              </span>
              <div className="space-y-1 text-text-muted">
                <div>Record ID: <code className="text-text-heading dark:text-white text-[11px]">{candidate.id}</code></div>
                <div>Gate Config ID: <code className="text-text-heading dark:text-white text-[11px]">{candidate.gate_config_id}</code></div>
                {candidate.ptk_id && candidate.ptk_id !== '-' && (
                  <div>PTK ID: <code className="text-text-heading dark:text-white text-[11px]">{candidate.ptk_id}</code></div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
