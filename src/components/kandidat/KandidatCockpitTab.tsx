import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Eye,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LabelList,
} from 'recharts';
import type { Candidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { CHART_COLORS, KANBAN_STAGES } from '../../theme/colors';
import { ChartGradients } from '../../theme/ChartGradients';
import { PieChartLegend } from '../PieChartLegend';
import { formatCurrencyShort, getAgeGroup, maskPhone } from '../../lib/transformers';

interface KandidatCockpitTabProps {
  candidates: Candidate[];
}

type DemographicMetric = 'gender' | 'usia' | 'pendidikan' | 'sumber' | 'gaji';

export const KandidatCockpitTab: React.FC<KandidatCockpitTabProps> = ({ candidates }) => {
  const setSelectedCandidateId = useDashboardStore((s) => s.setSelectedCandidateId);
  const toggleCrossFilter = useDashboardStore((s) => s.toggleCrossFilter);
  const crossFilter = useDashboardStore((s) => s.crossFilter);
  const maskPii = useDashboardStore((s) => s.maskPii);

  const [activeDemographic, setActiveDemographic] = useState<DemographicMetric>('gender');

  const totalCandidates = candidates.length || 1;

  // 1. Funnel data with conversion
  const funnelData = useMemo(() => {
    return KANBAN_STAGES.map((stage, idx) => {
      const count = candidates.filter((c) => c.status_screening_candidate === stage).length;
      const prevCount =
        idx === 0
          ? totalCandidates
          : candidates.filter((c) => c.status_screening_candidate === KANBAN_STAGES[idx - 1]).length;
      const conversionRate = prevCount > 0 ? ((count / prevCount) * 100).toFixed(0) : '0';
      return {
        stage,
        shortStage: stage.replace('Wawancara ', 'W. '),
        count,
        pctOfTotal: ((count / totalCandidates) * 100).toFixed(0),
        conversionRate,
      };
    });
  }, [candidates, totalCandidates]);

  // 2. Top 5 Positions
  const topPositions = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const pos = c.position_clean || 'Lainnya';
      map[pos] = (map[pos] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCandidates) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 20 ? name.substring(0, 18) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [candidates, totalCandidates]);

  // 3. Upcoming Interviews (sorted by date)
  const upcomingInterviews = useMemo(() => {
    return candidates
      .filter((c) => c.interview_date)
      .sort((a, b) => (a.interview_date! > b.interview_date! ? 1 : -1))
      .slice(0, 6);
  }, [candidates]);

  // 4. Recent / Top Candidates
  const recentCandidates = useMemo(() => {
    return [...candidates]
      .sort((a, b) => (b.screening_score || 0) - (a.screening_score || 0))
      .slice(0, 6);
  }, [candidates]);

interface DemographicItem {
  name: string;
  shortName: string;
  value: number;
  labelPercent?: string;
  labelSalary?: string;
}

  // 5. Demographics dataset based on active pill
  const demographicData: DemographicItem[] = useMemo(() => {
    const map: Record<string, number> = {};
    if (activeDemographic === 'gender') {
      candidates.forEach((c) => {
        const val = c.gender || 'Tidak Dicantumkan';
        map[val] = (map[val] || 0) + 1;
      });
    } else if (activeDemographic === 'usia') {
      candidates.forEach((c) => {
        const grp = getAgeGroup(c.candidate_age);
        map[grp] = (map[grp] || 0) + 1;
      });
    } else if (activeDemographic === 'pendidikan') {
      candidates.forEach((c) => {
        const val = c.candidate_education || 'Lainnya';
        map[val] = (map[val] || 0) + 1;
      });
    } else if (activeDemographic === 'sumber') {
      candidates.forEach((c) => {
        const val = c.sumber_info || 'Lainnya';
        map[val] = (map[val] || 0) + 1;
      });
    } else if (activeDemographic === 'gaji') {
      const posMap: Record<string, { sum: number; cnt: number }> = {};
      candidates.forEach((c) => {
        if (c.gaji_ekspetasi_num > 0) {
          const pos = c.position_clean || 'Umum';
          if (!posMap[pos]) posMap[pos] = { sum: 0, cnt: 0 };
          posMap[pos].sum += c.gaji_ekspetasi_num;
          posMap[pos].cnt += 1;
        }
      });
      return Object.entries(posMap)
        .map(([name, d]): DemographicItem => {
          const avg = Math.round(d.sum / d.cnt);
          return {
            name,
            shortName: name.length > 16 ? name.substring(0, 14) + '...' : name,
            value: avg,
            labelSalary: formatCurrencyShort(avg),
            labelPercent: undefined,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }

    return Object.entries(map)
      .map(([name, value]): DemographicItem => {
        const pct = ((value / totalCandidates) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 16 ? name.substring(0, 14) + '...' : name,
          value,
          labelPercent: `${value} (${pct}%)`,
          labelSalary: undefined,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [candidates, activeDemographic, totalCandidates]);

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2.5 h-full overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          KOLOM 1: Funnel Rekrutmen & Posisi Diminati
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        {/* Card Funnel 5 Tahapan */}
        <div className="flex-1 min-h-0 flex flex-col p-2.5 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
                Funnel 5 Tahapan Seleksi
              </h3>
            </div>
            <span className="text-[10px] text-text-muted">Konversi Pipeline</span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col justify-around py-0.5 space-y-1 overflow-hidden">
            {funnelData.map((item, idx) => {
              const isSelected =
                crossFilter?.key === 'status_screening_candidate' &&
                crossFilter.value === item.stage;
              const gradients = [
                'from-[#FF5A1F] to-[#FFA07A]',
                'from-[#F97316] to-[#FBBF24]',
                'from-[#F59E0B] to-[#FCD34D]',
                'from-[#1F7A5C] to-[#34D399]',
                'from-[#05473A] to-[#1F7A5C]',
              ];
              const gradientClass = gradients[idx % gradients.length];

              return (
                <div
                  key={item.stage}
                  onClick={() =>
                    toggleCrossFilter({
                      source: 'funnel',
                      key: 'status_screening_candidate',
                      value: item.stage,
                      label: `Tahap: ${item.shortStage}`,
                    })
                  }
                  className={`cursor-pointer p-1.5 rounded-md transition-all ${
                    isSelected
                      ? 'bg-[#FF5A1F]/15 ring-1 ring-[#FF5A1F]'
                      : 'hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="font-semibold text-text-heading dark:text-[#E7F5EF] truncate max-w-[150px]">
                      {idx + 1}. {item.shortStage}
                    </span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="font-black text-text-heading dark:text-white">
                        {item.count}
                      </span>
                      <span className="text-[10px] text-text-muted">({item.pctOfTotal}%)</span>
                    </div>
                  </div>

                  {/* Progress bar with smooth gradient */}
                  <div className="w-full bg-[#E3EAE6] dark:bg-[#0A382E] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(6, Number(item.pctOfTotal))}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Top Posisi */}
        <div className="h-[46%] min-h-0 flex flex-col p-2.5 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
            <div className="flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
                Top 5 Posisi Paling Diminati
              </h3>
            </div>
            <span className="text-[10px] text-text-muted">Volume Pelamar</span>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topPositions}
                layout="vertical"
                margin={{ top: 2, right: 65, left: 10, bottom: 2 }}
              >
                <ChartGradients />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                  width={135}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} kandidat`, 'Total']}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '11px',
                    padding: '4px 8px',
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  onClick={(d: any) => {
                    const val = String(d?.name || d?.payload?.name || '');
                    if (val) {
                      toggleCrossFilter({
                        source: 'cockpit-pos',
                        key: 'position_clean',
                        value: val,
                        label: `Posisi: ${val}`,
                      });
                    }
                  }}
                  cursor="pointer"
                >
                  {topPositions.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        crossFilter?.key === 'position_clean' && crossFilter.value === d.name
                          ? 'url(#activeHighlightGrad)'
                          : 'url(#orangeGradH)'
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="labelPercent"
                    position="right"
                    offset={8}
                    fill="currentColor"
                    className="text-text-heading dark:text-[#E7F5EF] text-[9.5px] font-bold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          KOLOM 2: Jadwal Terdekat & Quick Candidates Action
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        {/* Jadwal Wawancara Terdekat */}
        <div className="flex-1 min-h-0 flex flex-col p-2.5 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
                Jadwal Interview Terdekat
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#FF5A1F]">
              {upcomingInterviews.length} Terjadwal
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
            {upcomingInterviews.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                Tidak ada jadwal interview dalam filter aktif.
              </div>
            ) : (
              upcomingInterviews.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className="p-2 rounded-lg bg-[#F1F5F2]/70 dark:bg-[#072A22]/60 hover:bg-[#E3EAE6] dark:hover:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-text-heading dark:text-[#E7F5EF] truncate max-w-[130px]">
                        {c.candidate_name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#1F7A5C]/15 text-[#1F7A5C] dark:text-emerald-300">
                        {c.screening_score || 0}
                      </span>
                    </div>

                    <div className="text-[10px] text-text-muted truncate max-w-[170px] mt-0.5">
                      {c.position_clean} • {c.outlet_clean}
                    </div>

                    <div className="flex items-center space-x-2 text-[9.5px] text-text-muted mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#FF5A1F]" />
                        <span>{c.interview_date}</span>
                      </span>
                      {c.interview_time && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{c.interview_time}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center space-x-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.interview_location_link && (
                      <a
                        href={c.interview_location_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-md bg-white dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] text-blue-600 dark:text-blue-400 hover:border-blue-400"
                        title="Lihat Google Maps"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCandidateId(c.id)}
                      className="p-1 rounded-md bg-[#1F7A5C] text-white hover:bg-[#18644b]"
                      title="Buka Drawer Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kandidat Skor Tertinggi / Prioritas */}
        <div className="h-[46%] min-h-0 flex flex-col p-2.5 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
            <div className="flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
                Kandidat Kualifikasi Unggul
              </h3>
            </div>
            <span className="text-[10px] text-text-muted">Skor Tertinggi</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {recentCandidates.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCandidateId(c.id)}
                className="py-1 px-2 rounded-md hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="min-w-0 pr-1">
                  <div className="font-semibold text-text-heading dark:text-[#E7F5EF] truncate max-w-[140px] text-[11px]">
                    {c.candidate_name}
                  </div>
                  <div className="text-[9.5px] text-text-muted truncate max-w-[140px]">
                    {c.position_clean}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      c.screening_status === 'Lolos'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {c.screening_status}
                  </span>
                  <span className="font-black text-[11px] text-[#1F7A5C] dark:text-emerald-300 w-6 text-right">
                    {c.screening_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          KOLOM 3: Demografi & Kompensasi Switcher (1-Screen)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col p-2.5 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-2xs overflow-hidden">
        {/* Header with Switcher Pills */}
        <div className="pb-1.5 mb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
              Distribusi Demografi & Profil
            </h3>
            <span className="text-[10px] text-text-muted">Klik pill untuk ganti grafik</span>
          </div>

          {/* Quick Pill Selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'gender', label: 'Gender' },
              { id: 'usia', label: 'Usia' },
              { id: 'pendidikan', label: 'Pendidikan' },
              { id: 'sumber', label: 'Sumber' },
              { id: 'gaji', label: 'Ekspektasi Gaji' },
            ].map((tab) => {
              const isActive = activeDemographic === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDemographic(tab.id as DemographicMetric)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#1F7A5C] text-white shadow-xs'
                      : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Chart Container (fits 100% remaining height) */}
        <div className="flex-1 min-h-0 w-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDemographic}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              {activeDemographic === 'gender' ? (
                /* Pie/Donut Chart for Gender with Gradients & Center Metric */
                <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                  <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartGradients />
                        <Tooltip
                          formatter={(val: any) => [`${val} orang (${((Number(val) / totalCandidates) * 100).toFixed(0)}%)`, 'Total']}
                          contentStyle={{
                            borderRadius: '8px',
                            fontSize: '11px',
                            padding: '4px 8px',
                          }}
                        />
                        <Pie
                          data={demographicData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="44%"
                          outerRadius="74%"
                          paddingAngle={3}
                          onClick={(d: any) => {
                            const val = String(d?.name || d?.payload?.name || '');
                            if (val) {
                              toggleCrossFilter({
                                source: 'cockpit-demog',
                                key: 'gender',
                                value: val,
                                label: `Gender: ${val}`,
                              });
                            }
                          }}
                          cursor="pointer"
                        >
                          {demographicData.map((d, i) => (
                            <Cell
                              key={i}
                              fill={
                                d.name.toLowerCase().includes('laki')
                                  ? 'url(#sliceGreenGrad)'
                                  : 'url(#sliceOrangeGrad)'
                              }
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Metric */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-sm font-black text-text-heading dark:text-[#E7F5EF] leading-none">
                        {totalCandidates}
                      </span>
                      <span className="text-[8.5px] font-bold text-text-muted mt-0.5">
                        Pelamar
                      </span>
                    </div>
                  </div>

                  {/* Clean Legend Badges */}
                  <PieChartLegend
                    items={demographicData.map((d) => ({
                      name: d.name,
                      count: d.value,
                      gradientClass: d.name.toLowerCase().includes('laki')
                        ? 'bg-gradient-to-r from-[#05473A] to-[#1F7A5C]'
                        : 'bg-gradient-to-r from-[#FF5A1F] to-[#FFA07A]',
                    }))}
                    total={totalCandidates}
                    onItemClick={(name) =>
                      toggleCrossFilter({
                        source: 'cockpit-demog',
                        key: 'gender',
                        value: name,
                        label: `Gender: ${name}`,
                      })
                    }
                    selectedName={crossFilter?.key === 'gender' ? crossFilter.value : undefined}
                    className="flex-1 min-w-0"
                  />
                </div>
              ) : activeDemographic === 'gaji' ? (
                /* Bar chart for salary with amber gradient */
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={demographicData}
                    layout="vertical"
                    margin={{ top: 5, right: 65, left: 10, bottom: 5 }}
                  >
                    <ChartGradients />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 9, fill: '#4B6358' }}
                      tickFormatter={(v) => formatCurrencyShort(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                      width={130}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrencyShort(Number(val)), 'Rata-rata Gaji']}
                      contentStyle={{
                        borderRadius: '8px',
                        fontSize: '11px',
                        padding: '4px 8px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#amberGradH)"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    >
                      <LabelList
                        dataKey="labelSalary"
                        position="right"
                        offset={8}
                        fill="currentColor"
                        className="text-text-heading dark:text-[#E7F5EF] text-[9.5px] font-bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                /* Horizontal Bar for Usia / Pendidikan / Sumber with green gradient */
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={demographicData}
                    layout="vertical"
                    margin={{ top: 5, right: 65, left: 10, bottom: 5 }}
                  >
                    <ChartGradients />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                      width={130}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} kandidat (${((Number(val) / totalCandidates) * 100).toFixed(0)}%)`, 'Total']}
                      contentStyle={{
                        borderRadius: '8px',
                        fontSize: '11px',
                        padding: '4px 8px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                      fill="url(#greenGradH)"
                      onClick={(d: any) => {
                        const val = String(d?.name || d?.payload?.name || '');
                        if (val) {
                          const key =
                            activeDemographic === 'usia'
                              ? 'age_group'
                              : activeDemographic === 'pendidikan'
                              ? 'candidate_education'
                              : 'sumber_info';
                          toggleCrossFilter({
                            source: 'cockpit-demog',
                            key,
                            value: val,
                            label: `${tabLabel(activeDemographic)}: ${val}`,
                          });
                        }
                      }}
                      cursor="pointer"
                    >
                      {demographicData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            crossFilter?.value === d.name
                              ? 'url(#activeHighlightGrad)'
                              : 'url(#greenGradH)'
                          }
                        />
                      ))}
                      <LabelList
                        dataKey="labelPercent"
                        position="right"
                        offset={8}
                        fill="currentColor"
                        className="text-text-heading dark:text-[#E7F5EF] text-[9.5px] font-bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend / Info strip at bottom */}
        <div className="pt-1.5 border-t border-[#E3EAE6] dark:border-[#0E4437] flex items-center justify-between text-[9.5px] text-text-muted shrink-0">
          <span>{demographicData.length} kategori terdata</span>
          <span className="font-semibold text-text-heading dark:text-[#E7F5EF]">
            Klik bar untuk memfilter data
          </span>
        </div>
      </div>
    </div>
  );
};

function tabLabel(type: DemographicMetric): string {
  switch (type) {
    case 'gender':
      return 'Gender';
    case 'usia':
      return 'Usia';
    case 'pendidikan':
      return 'Pendidikan';
    case 'sumber':
      return 'Sumber';
    case 'gaji':
      return 'Gaji';
  }
}
