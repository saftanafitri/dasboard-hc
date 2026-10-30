import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  ListFilter
} from 'lucide-react';
import { Candidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';

interface KandidatCalendarTabProps {
  candidates: Candidate[];
}

export const KandidatCalendarTab: React.FC<KandidatCalendarTabProps> = ({ candidates }) => {
  const setSelectedCandidateId = useDashboardStore((s) => s.setSelectedCandidateId);

  // Filter candidates that have interview_date
  const interviewCandidates = useMemo(() => {
    return candidates.filter((c) => c.interview_date);
  }, [candidates]);

  // Current view month (default to October 2026 based on data, or latest interview date)
  const initialDate = useMemo(() => {
    if (interviewCandidates.length > 0) {
      const dates = interviewCandidates.map((c) => new Date(c.interview_date!).getTime());
      const maxDate = new Date(Math.max(...dates));
      return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    }
    return new Date(2026, 9, 1); // Okt 2026
  }, [interviewCandidates]);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Map candidates by date string (YYYY-MM-DD)
  const interviewMap = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    for (const c of interviewCandidates) {
      if (c.interview_date) {
        if (!map[c.interview_date]) map[c.interview_date] = [];
        map[c.interview_date].push(c);
      }
    }
    return map;
  }, [interviewCandidates]);

  // Build days for month grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust so Monday is 0
    const startOffset = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 12 : month;
      const prevY = month === 0 ? year - 1 : year;
      const str = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr: str, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr: str, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to complete 35 or 42 cells
    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 1 : month + 2;
      const nextY = month === 11 ? year + 1 : year;
      const str = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr: str, dayNum: d, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs mb-2 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#1F7A5C]/10 text-green-900 dark:text-emerald-300">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-heading dark:text-[#E7F5EF] capitalize leading-none">
              {monthName}
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">
              {interviewCandidates.length} jadwal wawancara tercatat
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* View toggle */}
          <div className="flex items-center bg-[#F1F5F2] dark:bg-[#0A382E] p-0.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] text-[11px]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs'
                  : 'text-text-muted hover:text-text-heading'
              }`}
            >
              Kalender Bulanan
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs'
                  : 'text-text-muted hover:text-text-heading'
              }`}
            >
              Daftar Agenda
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center space-x-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-muted"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-muted"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' ? (
        <div className="flex-1 min-h-0 flex flex-col p-2.5 rounded-xl bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-text-muted pb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
            {dayHeaders.map((dh) => (
              <div key={dh} className="py-0.5">
                {dh}
              </div>
            ))}
          </div>

          {/* Calendar cell grid */}
          <div className="flex-1 min-h-0 grid grid-cols-7 gap-1 pt-1 overflow-y-auto">
            {monthDays.map((d, idx) => {
              const dayInterviews = interviewMap[d.dateStr] || [];
              const hasEvents = dayInterviews.length > 0;

              return (
                <div
                  key={`${d.dateStr}-${idx}`}
                  className={`min-h-[70px] p-1.5 rounded-lg border flex flex-col justify-between transition-colors ${
                    !d.isCurrentMonth
                      ? 'bg-gray-50/50 dark:bg-gray-900/20 border-transparent text-gray-400 opacity-50'
                      : hasEvents
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-[#F1F5F2]/40 dark:bg-[#072A22]/40 border-[#E3EAE6] dark:border-[#0E4437]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-[10px] font-bold ${
                        hasEvents ? 'text-green-900 dark:text-emerald-300' : 'text-text-muted'
                      }`}
                    >
                      {d.dayNum}
                    </span>
                    {hasEvents && (
                      <span className="px-1 py-0.2 rounded-full text-[8px] font-black bg-[#1F7A5C] text-white">
                        {dayInterviews.length}
                      </span>
                    )}
                  </div>

                  {/* Interview Events list */}
                  <div className="space-y-0.5 overflow-y-auto max-h-[45px]">
                    {dayInterviews.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidateId(cand.id)}
                        className="p-1 rounded bg-white dark:bg-[#0A382E] border border-emerald-300/60 dark:border-emerald-700/60 shadow-2xs hover:border-[#FF5A1F] cursor-pointer text-[9px] transition-all group"
                      >
                        <div className="font-bold text-text-heading dark:text-white truncate group-hover:text-[#1F7A5C]">
                          {cand.candidate_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List Agenda View */
        <div className="flex-1 min-h-0 overflow-y-auto p-3 rounded-xl bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs space-y-2">
          <h4 className="font-bold text-sm text-text-heading dark:text-[#E7F5EF] mb-2">
            Seluruh Agenda Interview
          </h4>
          <div className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
            {interviewCandidates.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                Tidak ada agenda interview untuk filter saat ini.
              </div>
            ) : (
              interviewCandidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F1F5F2]/50 dark:hover:bg-[#072A22]/50 p-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-text-heading dark:text-white">
                        {cand.candidate_name}
                      </div>
                      <div className="text-xs text-[#1F7A5C] font-semibold">
                        {cand.position_placement}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
                        <span className="flex items-center space-x-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{cand.interview_date}</span>
                        </span>
                        {cand.interview_time && <span>• {cand.interview_time}</span>}
                        {cand.interview_location_name && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-text-muted" />
                            <span>{cand.interview_location_name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                    {cand.interview_location_link && (
                      <a
                        href={cand.interview_location_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E3EAE6] dark:border-[#0E4437] hover:border-blue-500 text-blue-600 dark:text-blue-400 flex items-center space-x-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1F7A5C] hover:bg-[#18644b] text-white transition-colors"
                    >
                      Buka Detail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
