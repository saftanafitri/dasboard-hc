import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  AtSign,
  GraduationCap,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Copy,
  Users2,
  DollarSign
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import type { Candidate } from '../../types';
import {
  formatCurrencyFull,
  formatWibDate,
  maskEmail,
  maskPhone,
} from '../../lib/transformers';
import { KANBAN_STAGES } from '../../theme/colors';

interface CandidateDrawerProps {
  candidates: Candidate[];
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ candidates }) => {
  const selectedCandidateId = useDashboardStore((s) => s.selectedCandidateId);
  const setSelectedCandidateId = useDashboardStore((s) => s.setSelectedCandidateId);
  const maskPii = useDashboardStore((s) => s.maskPii);
  const compareCandidateIds = useDashboardStore((s) => s.compareCandidateIds);
  const toggleCompareCandidate = useDashboardStore((s) => s.toggleCompareCandidate);
  const addToast = useDashboardStore((s) => s.addToast);

  const currentIndex = candidates.findIndex((c) => c.id === selectedCandidateId);
  const candidate = currentIndex !== -1 ? candidates[currentIndex] : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCandidateId) return;

      if (e.key === 'Escape') {
        setSelectedCandidateId(null);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedCandidateId(candidates[currentIndex - 1].id);
      } else if (e.key === 'ArrowRight' && currentIndex < candidates.length - 1) {
        setSelectedCandidateId(candidates[currentIndex + 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCandidateId, currentIndex, candidates, setSelectedCandidateId]);

  if (!candidate) return null;

  const isCompared = compareCandidateIds.includes(candidate.id);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} disalin ke clipboard`, 'info');
  };

  const currentStageIndex = KANBAN_STAGES.indexOf(
    candidate.status_screening_candidate as (typeof KANBAN_STAGES)[number]
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCandidateId(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl h-full bg-surface shadow-drawer border-l border-[#E3EAE6] dark:border-[#0E4437] flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E3EAE6] dark:border-[#0E4437] bg-[#F1F5F2] dark:bg-[#072A22]/80">
            <div className="flex items-center space-x-2">
              <button
                disabled={currentIndex <= 0}
                onClick={() => setSelectedCandidateId(candidates[currentIndex - 1].id)}
                className="p-1.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] bg-white dark:bg-[#0A382E] text-text-muted hover:text-text-heading disabled:opacity-40 disabled:cursor-not-allowed"
                title="Kandidat Sebelumnya (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentIndex >= candidates.length - 1}
                onClick={() => setSelectedCandidateId(candidates[currentIndex + 1].id)}
                className="p-1.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] bg-white dark:bg-[#0A382E] text-text-muted hover:text-text-heading disabled:opacity-40 disabled:cursor-not-allowed"
                title="Kandidat Berikutnya (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-text-muted">
                {currentIndex + 1} dari {candidates.length} kandidat
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Compare toggle button */}
              <button
                onClick={() => toggleCompareCandidate(candidate.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                  isCompared
                    ? 'bg-[#1F7A5C] text-white'
                    : 'bg-white dark:bg-[#0A382E] text-text-heading border border-[#E3EAE6] dark:border-[#0E4437] hover:border-[#1F7A5C]'
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Sedang Dibandingkan' : 'Bandingkan'}</span>
              </button>

              <button
                onClick={() => setSelectedCandidateId(null)}
                className="p-1.5 rounded-lg hover:bg-[#E3EAE6] dark:hover:bg-[#0E4437] text-text-muted transition-colors"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Candidate Identity Profile */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1F7A5C] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0 uppercase">
                {candidate.candidate_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-text-heading dark:text-[#E7F5EF] tracking-tight">
                    {candidate.candidate_name}
                  </h2>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      candidate.screening_status === 'Lolos'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {candidate.screening_status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-green-700 dark:text-emerald-400">
                  {candidate.position_placement}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1.5">
                  <span>Usia: {candidate.candidate_age} th</span>
                  <span>•</span>
                  <span>{candidate.gender}</span>
                  <span>•</span>
                  <span>{candidate.status_marital}</span>
                  <span>•</span>
                  <span>{candidate.domisili_kota || candidate.candidate_domicile}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F1F5F2] dark:bg-[#0A382E]/50 border border-[#E3EAE6] dark:border-[#0E4437]">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted">Skor Screening</span>
                <div className="text-xl font-extrabold text-green-700 dark:text-emerald-300">
                  {candidate.screening_score}
                  <span className="text-xs text-text-muted font-normal"> / 100</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted">Pengalaman F&B</span>
                <div className="text-xs font-bold text-text-heading dark:text-white mt-1 truncate">
                  {candidate.pengalaman_fnb}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted">Ekspektasi Gaji</span>
                <div className="text-xs font-bold text-[#FF5A1F] mt-1">
                  {formatCurrencyFull(candidate.gaji_ekspetasi_num)}
                </div>
              </div>
            </div>

            {/* Stage Progress Pipeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Riwayat & Tahapan Rekrutmen
              </span>
              <div className="p-4 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] bg-white dark:bg-[#072A22]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-text-heading dark:text-white">
                    Tahap Saat Ini: <span className="text-[#1F7A5C] font-bold">{candidate.status_screening_candidate}</span>
                  </span>
                  {candidate.recruitment_status && candidate.recruitment_status !== '-' && (
                    <span className="text-[11px] text-text-muted bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      Status: {candidate.recruitment_status}
                    </span>
                  )}
                </div>

                {/* Visual Steps */}
                <div className="flex items-center justify-between relative mt-2">
                  <div className="absolute left-2 right-2 top-3 h-0.5 bg-[#E3EAE6] dark:bg-[#0E4437] -z-0" />
                  {KANBAN_STAGES.map((stg, i) => {
                    const isPassed = currentStageIndex >= i;
                    const isCurrent = currentStageIndex === i;
                    return (
                      <div key={stg} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#FF5A1F] text-white ring-4 ring-[#FF5A1F]/20'
                              : isPassed
                              ? 'bg-[#1F7A5C] text-white'
                              : 'bg-[#E3EAE6] dark:bg-[#0E4437] text-text-muted'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className="text-[9px] text-center font-medium text-text-muted mt-1 max-w-[65px] leading-tight">
                          {stg.replace('Wawancara ', 'W. ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interview Information (if scheduled) */}
            {candidate.interview_date && (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Jadwal Wawancara</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-text-heading dark:text-[#E7F5EF]">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      {candidate.interview_date} {candidate.interview_time || ''}
                    </span>
                  </div>
                  {candidate.interview_location_name && (
                    <div className="flex items-center space-x-2 text-text-heading dark:text-[#E7F5EF]">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{candidate.interview_location_name}</span>
                    </div>
                  )}
                </div>
                {candidate.interview_location_link && (
                  <a
                    href={candidate.interview_location_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>Buka Lokasi di Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Kontak & Komunikasi
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* WhatsApp */}
                <div className="p-3 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#059669]" />
                    <div>
                      <div className="text-[10px] text-text-muted font-medium">No. WhatsApp</div>
                      <div className="font-semibold text-text-heading dark:text-white">
                        {maskPii ? maskPhone(candidate.no_wa) : candidate.no_wa}
                      </div>
                    </div>
                  </div>
                  {!maskPii && (
                    <button
                      onClick={() => handleCopyText(candidate.no_wa, 'No. WhatsApp')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-text-muted"
                      title="Salin Nomor"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Email */}
                <div className="p-3 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-[10px] text-text-muted font-medium">Email</div>
                      <div className="font-semibold text-text-heading dark:text-white truncate">
                        {maskPii ? maskEmail(candidate.email) : candidate.email}
                      </div>
                    </div>
                  </div>
                  {!maskPii && (
                    <button
                      onClick={() => handleCopyText(candidate.email, 'Email')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-text-muted shrink-0"
                      title="Salin Email"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Instagram */}
                {candidate.instagram && candidate.instagram !== '-' && (
                  <div className="p-3 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] flex items-center space-x-2">
                    <AtSign className="w-4 h-4 text-pink-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-text-muted font-medium">Instagram</div>
                      <div className="font-semibold text-text-heading dark:text-white">
                        {candidate.instagram}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sumber Info */}
                <div className="p-3 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[#1F7A5C] shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-muted font-medium">Sumber Informasi</div>
                    <div className="font-semibold text-text-heading dark:text-white">
                      {candidate.sumber_info}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Background */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Pendidikan & Pengalaman
              </span>
              <div className="p-4 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] space-y-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <GraduationCap className="w-4 h-4 text-[#1F7A5C] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-text-heading dark:text-white">
                      {candidate.candidate_education} - {candidate.jurusan || '-'}
                    </div>
                    <div className="text-text-muted">{candidate.institusi || 'Institusi tidak disebutkan'}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 pt-2 border-t border-[#E3EAE6] dark:border-[#0E4437]">
                  <Briefcase className="w-4 h-4 text-[#FF5A1F] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-text-heading dark:text-white">
                      Pekerjaan Terakhir: {candidate.pekerjaan_terakhir || '-'}
                    </div>
                    <div className="text-text-muted">
                      Latar Belakang: {candidate.latar_belakang_pengalaman}
                    </div>
                    <div className="text-text-muted">
                      Bidang: {candidate.candidate_experience_field} ({candidate.pengalaman_tahun} th)
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 pt-2 border-t border-[#E3EAE6] dark:border-[#0E4437]">
                  <DollarSign className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div>
                      <div className="text-[10px] text-text-muted">Gaji Terakhir</div>
                      <div className="font-semibold text-text-heading dark:text-white">
                        {formatCurrencyFull(candidate.gaji_terakhir_num)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">Ekspektasi Gaji</div>
                      <div className="font-semibold text-[#FF5A1F]">
                        {formatCurrencyFull(candidate.gaji_ekspetasi_num)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Documents Info (NO base64 rendering) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Dokumen Terlampir
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* CV File */}
                <div className="p-3 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-text-heading dark:text-white truncate" title={candidate.uploaded_files_cv_name || 'Tidak ada CV'}>
                      {candidate.uploaded_files_cv_name || 'Berkas CV'}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {candidate.uploaded_files_cv_size ? `${candidate.uploaded_files_cv_size} • PDF` : 'Tersedia'}
                    </div>
                  </div>
                </div>

                {/* Photo File */}
                <div className="p-3 rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] flex items-center space-x-2.5">
                  <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-text-heading dark:text-white truncate" title={candidate.uploaded_files_foto_name || 'Tidak ada Foto'}>
                      {candidate.uploaded_files_foto_name || 'Foto Kandidat'}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {candidate.uploaded_files_foto_size ? `${candidate.uploaded_files_foto_size} • JPG` : 'Tersedia'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-2 text-[11px] text-text-muted border-t border-[#E3EAE6] dark:border-[#0E4437] flex items-center justify-between">
              <span>ID: {candidate.id}</span>
              <span>Terdaftar: {candidate.created_at_formatted}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
