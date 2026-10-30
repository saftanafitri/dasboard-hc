import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  GripVertical
} from 'lucide-react';
import { Candidate } from '../../types';
import { KANBAN_STAGES } from '../../theme/colors';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatCurrencyShort } from '../../lib/transformers';

interface KandidatKanbanTabProps {
  candidates: Candidate[];
}

export const KandidatKanbanTab: React.FC<KandidatKanbanTabProps> = ({ candidates }) => {
  const moveCandidateStage = useDashboardStore((s) => s.moveCandidateStage);
  const setSelectedCandidateId = useDashboardStore((s) => s.setSelectedCandidateId);
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [activeMenuCandidateId, setActiveMenuCandidateId] = useState<string | null>(null);

  // Group candidates by status_screening_candidate
  const stageGroups = React.useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    for (const stage of KANBAN_STAGES) {
      map[stage] = [];
    }
    for (const c of candidates) {
      const st = c.status_screening_candidate;
      if (map[st]) {
        map[st].push(c);
      } else {
        // Fallback to first stage if unmapped
        map[KANBAN_STAGES[0]].push(c);
      }
    }
    return map;
  }, [candidates]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedCandidateId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const candId = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    if (candId) {
      moveCandidateStage(candId, targetStage);
    }
    setDraggedCandidateId(null);
    setDragOverStage(null);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      {/* Kanban Info Banner */}
      <div className="flex items-center justify-between py-1 px-3 rounded-lg bg-[#F1F5F2] dark:bg-[#072A22] border border-[#E3EAE6] dark:border-[#0E4437] text-xs mb-2 shrink-0">
        <div className="flex items-center space-x-2 text-text-heading dark:text-[#E7F5EF]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[11px]">Pipeline Kanban:</span>
          <span className="text-text-muted text-[11px]">
            Tarik kartu kandidat ke kolom tahap lain untuk memperbarui status seleksi secara real-time.
          </span>
        </div>
        <span className="text-[10px] text-text-muted font-bold">
          {candidates.length} kandidat
        </span>
      </div>

      {/* 5 Kanban Columns */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 gap-2.5 items-stretch overflow-hidden">
        {KANBAN_STAGES.map((stage, idx) => {
          const list = stageGroups[stage] || [];
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage)}
              className={`flex flex-col rounded-xl p-2.5 bg-surface border transition-all duration-150 h-full overflow-hidden ${
                isOver
                  ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/30 bg-[#FF5A1F]/5'
                  : 'border-[#E3EAE6] dark:border-[#0E4437] shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1F7A5C] text-white text-[9px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-[11px] text-text-heading dark:text-[#E7F5EF] leading-tight truncate" title={stage}>
                    {stage}
                  </h4>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#F1F5F2] dark:bg-[#0A382E] text-green-900 dark:text-emerald-300 border border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
                  {list.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
                {list.length === 0 ? (
                  <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#E3EAE6] dark:border-[#0E4437] rounded-xl text-text-muted text-xs p-2 text-center">
                    <span className="text-[11px]">Kosong</span>
                    <span className="text-[9px] text-text-muted/70">Tarik kandidat ke sini</span>
                  </div>
                ) : (
                  list.map((cand) => (
                    <div
                      key={cand.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cand.id)}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className="group relative p-3.5 rounded-xl bg-white dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs hover:shadow-card hover:border-[#1F7A5C] cursor-grab active:cursor-grabbing transition-all select-none"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <div className="flex items-center space-x-1.5 overflow-hidden">
                          <GripVertical className="w-3.5 h-3.5 text-text-muted/50 group-hover:text-green-700 shrink-0" />
                          <h5 className="font-bold text-xs text-text-heading dark:text-white truncate" title={cand.candidate_name}>
                            {cand.candidate_name}
                          </h5>
                        </div>

                        {/* Move stage dropdown button */}
                        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              setActiveMenuCandidateId(
                                activeMenuCandidateId === cand.id ? null : cand.id
                              )
                            }
                            className="p-1 rounded-md text-text-muted hover:text-text-heading hover:bg-[#F1F5F2] dark:hover:bg-[#072A22]"
                            title="Pindah tahap manual"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuCandidateId === cand.id && (
                            <div className="absolute right-0 top-6 z-40 w-44 p-1.5 rounded-xl bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xl text-xs space-y-0.5">
                              <div className="text-[10px] font-bold text-text-muted px-2 py-1 uppercase">
                                Pindah Tahap:
                              </div>
                              {KANBAN_STAGES.map((st) => (
                                <button
                                  key={st}
                                  disabled={st === stage}
                                  onClick={() => {
                                    moveCandidateStage(cand.id, st);
                                    setActiveMenuCandidateId(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    st === stage
                                      ? 'text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                                      : 'text-text-heading dark:text-white hover:bg-[#1F7A5C] hover:text-white'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Position & Outlet */}
                      <div className="text-[11px] font-semibold text-green-700 dark:text-emerald-400 truncate mb-1">
                        {cand.position_clean}
                      </div>

                      {/* Score & Age pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px]">
                        <span className="font-bold px-1.5 py-0.5 rounded-md bg-[#1F7A5C]/10 text-green-900 dark:text-emerald-300 border border-[#1F7A5C]/30">
                          Skor: {cand.screening_score}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-text-muted">
                          {cand.candidate_age} th
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-semibold ${
                            cand.screening_status === 'Lolos'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          }`}
                        >
                          {cand.screening_status}
                        </span>
                      </div>

                      {/* Interview info if scheduled */}
                      {cand.interview_date && (
                        <div className="flex items-center space-x-1 text-[10px] font-semibold text-blue-700 dark:text-blue-400 pt-1.5 border-t border-[#E3EAE6] dark:border-[#0E4437]">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span className="truncate">{cand.interview_date} {cand.interview_time || ''}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
