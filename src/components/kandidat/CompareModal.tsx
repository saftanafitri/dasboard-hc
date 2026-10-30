import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Candidate } from '../../types';
import { formatCurrencyFull, maskEmail, maskPhone } from '../../lib/transformers';

interface CompareModalProps {
  candidates: Candidate[];
}

export const CompareModal: React.FC<CompareModalProps> = ({ candidates }) => {
  const compareCandidateIds = useDashboardStore((s) => s.compareCandidateIds);
  const clearCompareCandidates = useDashboardStore((s) => s.clearCompareCandidates);
  const toggleCompareCandidate = useDashboardStore((s) => s.toggleCompareCandidate);
  const maskPii = useDashboardStore((s) => s.maskPii);

  if (compareCandidateIds.length < 2) return null;

  const selectedCandidates = compareCandidateIds
    .map((id) => candidates.find((c) => c.id === id))
    .filter(Boolean) as Candidate[];

  const rows = [
    { label: 'Posisi & Penempatan', getVal: (c: Candidate) => c.position_placement },
    {
      label: 'Status Screening',
      render: (c: Candidate) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-block ${
            c.screening_status === 'Lolos'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
          }`}
        >
          {c.screening_status}
        </span>
      ),
    },
    {
      label: 'Skor Screening',
      render: (c: Candidate) => (
        <span className="font-extrabold text-base text-green-700 dark:text-emerald-400">
          {c.screening_score} / 100
        </span>
      ),
    },
    { label: 'Tahap Rekrutmen', getVal: (c: Candidate) => c.status_screening_candidate },
    { label: 'Usia', getVal: (c: Candidate) => `${c.candidate_age} tahun` },
    { label: 'Gender', getVal: (c: Candidate) => c.gender },
    { label: 'Pendidikan', getVal: (c: Candidate) => `${c.candidate_education} (${c.jurusan || '-'})` },
    { label: 'Institusi', getVal: (c: Candidate) => c.institusi || '-' },
    { label: 'Pengalaman F&B', getVal: (c: Candidate) => c.pengalaman_fnb },
    { label: 'Tahun Pengalaman', getVal: (c: Candidate) => `${c.candidate_experience_years} tahun` },
    { label: 'Pekerjaan Terakhir', getVal: (c: Candidate) => c.pekerjaan_terakhir || '-' },
    {
      label: 'Ekspektasi Gaji',
      render: (c: Candidate) => (
        <span className="font-bold text-[#FF5A1F]">{formatCurrencyFull(c.gaji_ekspetasi_num)}</span>
      ),
    },
    {
      label: 'Gaji Terakhir',
      render: (c: Candidate) => formatCurrencyFull(c.gaji_terakhir_num),
    },
    { label: 'Domisili', getVal: (c: Candidate) => c.domisili_kota || c.candidate_domicile },
    {
      label: 'Kontak WhatsApp',
      getVal: (c: Candidate) => (maskPii ? maskPhone(c.no_wa) : c.no_wa),
    },
    {
      label: 'Email',
      getVal: (c: Candidate) => (maskPii ? maskEmail(c.email) : c.email),
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearCompareCandidates}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl bg-surface rounded-2xl shadow-2xl border border-[#E3EAE6] dark:border-[#0E4437] overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E3EAE6] dark:border-[#0E4437] bg-[#F1F5F2] dark:bg-[#072A22]">
            <div>
              <h2 className="text-lg font-extrabold text-text-heading dark:text-[#E7F5EF]">
                Bandingkan Kandidat ({selectedCandidates.length} Terpilih)
              </h2>
              <p className="text-xs text-text-muted">
                Perbandingan side-by-side metrik kualifikasi dan kriteria seleksi.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearCompareCandidates}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
              <button
                onClick={clearCompareCandidates}
                className="p-1.5 rounded-lg hover:bg-[#E3EAE6] dark:hover:bg-[#0E4437] text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-x-auto p-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1F7A5C]/30">
                  <th className="p-3 font-bold text-text-muted w-1/4 uppercase tracking-wider">
                    Kriteria / Atribut
                  </th>
                  {selectedCandidates.map((cand) => (
                    <th key={cand.id} className="p-3 min-w-[200px]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-extrabold text-sm text-text-heading dark:text-white">
                            {cand.candidate_name}
                          </div>
                          <div className="text-[11px] text-[#1F7A5C] font-semibold mt-0.5">
                            {cand.position_clean}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCompareCandidate(cand.id)}
                          className="p-1 text-text-muted hover:text-red-500 rounded"
                          title="Keluarkan dari perbandingan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
                {rows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={idx % 2 === 0 ? 'bg-transparent' : 'bg-[#F1F5F2]/40 dark:bg-[#072A22]/30'}
                  >
                    <td className="p-3 font-semibold text-text-muted">{row.label}</td>
                    {selectedCandidates.map((cand) => (
                      <td key={cand.id} className="p-3 text-text-heading dark:text-[#E7F5EF]">
                        {row.render ? row.render(cand) : row.getVal ? row.getVal(cand) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
