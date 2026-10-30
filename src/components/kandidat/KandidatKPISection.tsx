import React, { useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  CalendarDays
} from 'lucide-react';
import { Candidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { KPICard } from '../KPICard';

interface KandidatKPISectionProps {
  candidates: Candidate[];
}

export const KandidatKPISection: React.FC<KandidatKPISectionProps> = ({ candidates }) => {
  const crossFilter = useDashboardStore((s) => s.crossFilter);
  const toggleCrossFilter = useDashboardStore((s) => s.toggleCrossFilter);
  const setCrossFilter = useDashboardStore((s) => s.setCrossFilter);

  // Compute metrics
  const totalPelamar = candidates.length;
  const lolosCount = useMemo(
    () => candidates.filter((c) => c.screening_status === 'Lolos').length,
    [candidates]
  );
  const lolosSebagianCount = useMemo(
    () => candidates.filter((c) => c.screening_status === 'Lolos Sebagian').length,
    [candidates]
  );
  const dalamProsesCount = useMemo(
    () =>
      candidates.filter(
        (c) => c.status_screening_candidate && c.status_screening_candidate !== '-'
      ).length,
    [candidates]
  );

  const avgScore = useMemo(() => {
    if (candidates.length === 0) return 0;
    const sum = candidates.reduce((acc, c) => acc + (c.screening_score || 0), 0);
    return sum / candidates.length;
  }, [candidates]);

  // Interview minggu ini (relative to 2026-10-29 or current week)
  const interviewMingguIni = useMemo(() => {
    const today = new Date('2026-10-29T00:00:00');
    // Monday of current week
    const day = today.getDay();
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().slice(0, 10);
    const sunStr = sunday.toISOString().slice(0, 10);

    return candidates.filter((c) => {
      if (!c.interview_date) return false;
      return c.interview_date >= monStr && c.interview_date <= sunStr;
    }).length;
  }, [candidates]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-0.5">
      {/* 1. TOTAL Pelamar */}
      <KPICard
        title="Total Pelamar"
        value={totalPelamar}
        subtitle="Seluruh berkas terdaftar"
        icon={<Users className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter === null}
        onClick={() => setCrossFilter(null)}
        tooltip="Klik untuk reset / tampilkan seluruh kandidat"
      />

      {/* 2. LOLOS */}
      <KPICard
        title="Lolos Seleksi"
        value={lolosCount}
        subtitle={`${totalPelamar > 0 ? ((lolosCount / totalPelamar) * 100).toFixed(0) : 0}% lolos kualifikasi`}
        icon={<CheckCircle2 className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'screening_status' && crossFilter.value === 'Lolos'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi',
            key: 'screening_status',
            value: 'Lolos',
            label: 'Screening: Lolos',
          })
        }
      />

      {/* 3. LOLOS SEBAGIAN */}
      <KPICard
        title="Lolos Sebagian"
        value={lolosSebagianCount}
        subtitle={`${totalPelamar > 0 ? ((lolosSebagianCount / totalPelamar) * 100).toFixed(0) : 0}% butuh review`}
        icon={<AlertCircle className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'screening_status' && crossFilter.value === 'Lolos Sebagian'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi',
            key: 'screening_status',
            value: 'Lolos Sebagian',
            label: 'Screening: Lolos Sebagian',
          })
        }
      />

      {/* 4. DALAM PROSES */}
      <KPICard
        title="Dalam Proses"
        value={dalamProsesCount}
        subtitle="Aktif di alur seleksi"
        icon={<Clock className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'in_process'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi',
            key: 'in_process',
            value: 'yes',
            label: 'Status: Dalam Proses',
          })
        }
      />

      {/* 5. Rata-rata Skor */}
      <KPICard
        title="Rata-rata Skor"
        value={avgScore}
        decimalPlaces={1}
        suffix="/ 100"
        subtitle="Klik: filter skor ≥ 80"
        icon={<Award className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'high_score'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi',
            key: 'high_score',
            value: '80',
            label: 'Skor Kualifikasi: ≥ 80',
          })
        }
        tooltip="Klik untuk memfilter kandidat dengan skor tinggi (≥ 80)"
      />

      {/* 6. Interview Minggu Ini */}
      <KPICard
        title="Interview Minggu Ini"
        value={interviewMingguIni}
        subtitle="Jadwal pekan aktif"
        icon={<CalendarDays className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'has_interview'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi',
            key: 'has_interview',
            value: 'yes',
            label: 'Jadwal: Memiliki Interview',
          })
        }
      />
    </div>
  );
};
