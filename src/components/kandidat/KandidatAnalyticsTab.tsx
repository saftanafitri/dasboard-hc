import React, { useState, useMemo } from 'react';
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
  AreaChart,
  Area,
  CartesianGrid,
  LabelList,
} from 'recharts';
import type { Candidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ChartCard } from '../ChartCard';
import { CHART_COLORS, KANBAN_STAGES } from '../../theme/colors';
import { ChartGradients, GRADIENT_SLICE_IDS } from '../../theme/ChartGradients';
import { PieChartLegend } from '../PieChartLegend';
import {
  FNB_EXPERIENCE_ORDER,
  formatCurrencyShort,
  getAgeGroup,
} from '../../lib/transformers';
import { Layers, Users2, DollarSign, LayoutGrid } from 'lucide-react';

interface KandidatAnalyticsTabProps {
  candidates: Candidate[];
}

type AnalyticsCategory = 'pipeline' | 'demografi' | 'kompensasi';

export const KandidatAnalyticsTab: React.FC<KandidatAnalyticsTabProps> = ({ candidates }) => {
  const crossFilter = useDashboardStore((s) => s.crossFilter);
  const toggleCrossFilter = useDashboardStore((s) => s.toggleCrossFilter);
  const setCrossFilter = useDashboardStore((s) => s.setCrossFilter);

  // Sub-tab category
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>('pipeline');

  // Domisili top 8 vs all
  const [showAllCities, setShowAllCities] = useState(false);

  // Gaji per Posisi (Rata-rata vs Median)
  const [salaryCalcType, setSalaryCalcType] = useState<'avg' | 'median'>('avg');

  const totalCount = candidates.length || 1;

  // Helper for type-safe cross-filtering from recharts
  const handleChartFilter = (source: string, key: string, raw: any, labelPrefix?: string) => {
    const val =
      typeof raw === 'string'
        ? raw
        : raw?.name || raw?.stage || raw?.rawField || raw?.payload?.name || raw?.payload?.stage || '';
    if (val) {
      toggleCrossFilter({
        source,
        key,
        value: String(val),
        label: labelPrefix ? `${labelPrefix}: ${val}` : String(val),
      });
    }
  };

  // Custom Tooltip renderer for count + percentage
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = typeof data.value === 'number' ? data.value : 0;
      const isCurrency = data.dataKey === 'salary';
      const pct = !isCurrency ? ((val / totalCount) * 100).toFixed(1) : null;

      return (
        <div className="p-2 bg-surface border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg shadow-xl text-xs space-y-0.5">
          <div className="font-bold text-text-heading dark:text-[#E7F5EF] text-[11px]">{label || data.name}</div>
          <div className="flex items-center space-x-1.5 text-green-700 dark:text-emerald-400 font-semibold text-[11px]">
            <span>
              {isCurrency ? formatCurrencyShort(val) : `${val.toLocaleString('id-ID')} kandidat`}
            </span>
            {pct !== null && <span className="text-text-muted">({pct}%)</span>}
          </div>
          <div className="text-[9px] text-text-muted">Klik untuk memfilter dashboard</div>
        </div>
      );
    }
    return null;
  };

  // 1. Funnel Tahapan Rekrutmen + Conversion Rate
  const funnelData = useMemo(() => {
    return KANBAN_STAGES.map((stage, idx) => {
      const count = candidates.filter((c) => c.status_screening_candidate === stage).length;
      const pct = ((count / totalCount) * 100).toFixed(0);
      return {
        stage,
        stageShort: stage.replace('Wawancara ', 'W. '),
        count,
        pctOfTotal: ((count / totalCount) * 100).toFixed(1),
        labelPercent: `${count} (${pct}%)`,
        conversionFromPrev:
          idx === 0
            ? '100'
            : candidates.filter((c) => c.status_screening_candidate === KANBAN_STAGES[idx - 1]).length > 0
            ? (
                (count /
                  candidates.filter((c) => c.status_screening_candidate === KANBAN_STAGES[idx - 1]).length) *
                100
              ).toFixed(1)
            : '0',
      };
    });
  }, [candidates, totalCount]);

  // 2. Posisi Paling Diminati
  const positionData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const pos = c.position_clean || 'Tidak Diketahui';
      map[pos] = (map[pos] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCount) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 18 ? name.substring(0, 16) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [candidates, totalCount]);

  // 3. Sumber Rekrutmen
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const src = c.sumber_info || 'Lainnya';
      map[src] = (map[src] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCount) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 16 ? name.substring(0, 14) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [candidates, totalCount]);

  // 4. Komposisi Gender
  const genderData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const g = c.gender || 'Tidak Terdata';
      map[g] = (map[g] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  }, [candidates]);

  // 5. Status Pernikahan
  const maritalData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const m = c.status_marital || 'Tidak Terdata';
      map[m] = (map[m] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCount) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 16 ? name.substring(0, 14) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [candidates, totalCount]);

  // 6. Kategori Lowongan
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const cat = c.kategori_lowongan || 'Umum';
      map[cat] = (map[cat] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCount) * 100).toFixed(0);
        return {
          name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [candidates, totalCount]);

  // 7. Tingkat Pendidikan Terakhir
  const educationData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const edu = c.candidate_education || 'Lainnya';
      map[edu] = (map[edu] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCount) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 16 ? name.substring(0, 14) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [candidates, totalCount]);

  // 8. Pengalaman Bidang F&B
  const fnbExpData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const f = c.pengalaman_fnb || 'Tidak Ada';
      map[f] = (map[f] || 0) + 1;
    }
    return FNB_EXPERIENCE_ORDER.map((orderName) => {
      const cnt = map[orderName] || 0;
      const pct = ((cnt / totalCount) * 100).toFixed(0);
      return {
        name: orderName,
        shortName: orderName.length > 16 ? orderName.substring(0, 14) + '...' : orderName,
        count: cnt,
        labelPercent: `${cnt} (${pct}%)`,
      };
    }).filter((d) => d.count > 0 || map[d.name] !== undefined);
  }, [candidates, totalCount]);

  // 9. Distribusi Domisili Kota
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const city = c.domisili_kota || 'Lainnya';
      map[city] = (map[city] || 0) + 1;
    }
    const all = Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalCount) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 15 ? name.substring(0, 13) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count);

    return showAllCities ? all : all.slice(0, 8);
  }, [candidates, showAllCities, totalCount]);

  // 10. Tren Pelamar Harian
  const dailyTrendData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of candidates) {
      const d = c.created_at ? c.created_at.slice(0, 10) : '2026-10-01';
      map[d] = (map[d] || 0) + 1;
    }
    return Object.entries(map)
      .map(([date, count]) => ({
        date,
        shortDate: date.slice(5),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [candidates]);

  // 11. Distribusi Usia
  const ageData = useMemo(() => {
    const map: Record<string, number> = {
      '< 20 th': 0,
      '20-24 th': 0,
      '25-29 th': 0,
      '30-34 th': 0,
      '≥ 35 th': 0,
    };
    for (const c of candidates) {
      const grp = getAgeGroup(c.candidate_age);
      if (map[grp] !== undefined) {
        map[grp] += 1;
      } else {
        map['25-29 th'] += 1;
      }
    }
    return Object.entries(map).map(([name, count]) => {
      const pct = ((count / totalCount) * 100).toFixed(0);
      return {
        name,
        count,
        labelPercent: `${count} (${pct}%)`,
      };
    });
  }, [candidates, totalCount]);

  // 12. Ekspektasi Gaji per Posisi
  const salaryData = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const c of candidates) {
      if (c.gaji_ekspetasi_num > 0) {
        const pos = c.position_clean || 'Umum';
        if (!map[pos]) map[pos] = [];
        map[pos].push(c.gaji_ekspetasi_num);
      }
    }

    return Object.entries(map)
      .map(([name, values]) => {
        let finalVal = 0;
        if (salaryCalcType === 'avg') {
          const sum = values.reduce((a, b) => a + b, 0);
          finalVal = Math.round(sum / values.length);
        } else {
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          finalVal =
            sorted.length % 2 !== 0
              ? sorted[mid]
              : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
        }
        return {
          name,
          shortName: name.length > 16 ? name.substring(0, 14) + '...' : name,
          salary: finalVal,
          labelSalary: formatCurrencyShort(finalVal),
        };
      })
      .sort((a, b) => b.salary - a.salary)
      .slice(0, 6);
  }, [candidates, salaryCalcType]);

  // Helper to render table view mode inside ChartCard
  const renderTableData = (data: { name: string; count?: number; salary?: number }[], valLabel = 'Jumlah') => (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#F1F5F2] dark:bg-[#072A22] sticky top-0 text-text-muted">
          <tr>
            <th className="p-1.5 font-semibold">Kategori</th>
            <th className="p-1.5 font-semibold text-right">{valLabel}</th>
            {data[0]?.count !== undefined && (
              <th className="p-1.5 font-semibold text-right">Rasio</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-[#F1F5F2]/50 dark:hover:bg-[#0A382E]/40">
              <td className="p-1.5 font-medium truncate max-w-[140px]">{row.name}</td>
              <td className="p-1.5 text-right font-bold text-green-900 dark:text-emerald-300">
                {row.salary !== undefined
                  ? formatCurrencyShort(row.salary)
                  : row.count?.toLocaleString('id-ID')}
              </td>
              {row.count !== undefined && (
                <td className="p-1.5 text-right text-text-muted">
                  {((row.count / totalCount) * 100).toFixed(1)}%
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      {/* Category Sub-Tabs (No scroll controller) */}
      <div className="flex items-center justify-between pb-1.5 mb-1 shrink-0 border-b border-[#E3EAE6] dark:border-[#0E4437]">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveCategory('pipeline')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition-all ${
              activeCategory === 'pipeline'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Pipeline & Rekrutmen</span>
          </button>

          <button
            onClick={() => setActiveCategory('demografi')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition-all ${
              activeCategory === 'demografi'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>2. Demografi & Profil</span>
          </button>

          <button
            onClick={() => setActiveCategory('kompensasi')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition-all ${
              activeCategory === 'kompensasi'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Kompensasi & Lokasi</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-text-muted font-medium hidden sm:flex">
          <LayoutGrid className="w-3 h-3 text-[#1F7A5C]" />
          <span>Tampilan 1-Layar (4 Grafik per Kategori)</span>
        </div>
      </div>

      {/* 2x2 Screen-Fitting Grid (ZERO SCROLL) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-2 h-full overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            KATEGORI 1: Pipeline & Rekrutmen (4 Grafik)
           ───────────────────────────────────────────────────────────── */}
        {activeCategory === 'pipeline' && (
          <>
            {/* 1. Funnel Tahapan Rekrutmen */}
            <ChartCard
              id="chart-funnel"
              title="Funnel Tahapan Rekrutmen"
              subtitle="Distribusi kandidat di 5 tahapan seleksi"
              allowedModes={['bar', 'table']}
              isFiltered={crossFilter?.key === 'status_screening_candidate'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(
                    funnelData.map((d) => ({ name: d.stage, count: d.count })),
                    'Kandidat'
                  )
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={funnelData}
                      layout="vertical"
                      margin={{ top: 2, right: 65, left: 10, bottom: 2 }}
                    >
                      <ChartGradients />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="stageShort"
                        tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                        width={120}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#greenGradH)"
                        onClick={(d) => handleChartFilter('chart-funnel', 'status_screening_candidate', d, 'Tahap')}
                        cursor="pointer"
                      >
                        {funnelData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'status_screening_candidate' &&
                              crossFilter.value === d.stage
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
                )
              }
            </ChartCard>

            {/* 2. Posisi Paling Diminati */}
            <ChartCard
              id="chart-position"
              title="Posisi Paling Diminati"
              subtitle="6 posisi dengan pelamar terbanyak"
              allowedModes={['donut', 'bar', 'table']}
              defaultMode="donut"
              isFiltered={crossFilter?.key === 'position_clean'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(positionData, 'Kandidat')
                ) : mode === 'donut' ? (
                  <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                    <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartGradients />
                          <Tooltip content={renderCustomTooltip} />
                          <Pie
                            data={positionData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="72%"
                            paddingAngle={2}
                            onClick={(d) => handleChartFilter('chart-posisi', 'position_clean', d, 'Posisi')}
                            cursor="pointer"
                          >
                            {positionData.map((_, idx) => (
                              <Cell key={idx} fill={GRADIENT_SLICE_IDS[idx % GRADIENT_SLICE_IDS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-black text-[#FF5A1F] dark:text-[#FF7A45] leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted mt-0.5">
                          Kandidat
                        </span>
                      </div>
                    </div>
                    <PieChartLegend
                      items={positionData}
                      total={totalCount}
                      onItemClick={(name) => handleChartFilter('chart-posisi', 'position_clean', name, 'Posisi')}
                      selectedName={crossFilter?.key === 'position_clean' ? crossFilter.value : undefined}
                      className="flex-1 min-w-0"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={positionData}
                      layout="vertical"
                      margin={{ top: 2, right: 65, left: 10, bottom: 2 }}
                    >
                      <ChartGradients />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                        width={140}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#orangeGradH)"
                        onClick={(d) => handleChartFilter('chart-posisi', 'position_clean', d, 'Posisi')}
                        cursor="pointer"
                      >
                        {positionData.map((d, idx) => (
                          <Cell
                            key={idx}
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
                )
              }
            </ChartCard>

            {/* 3. Sumber Rekrutmen */}
            <ChartCard
              id="chart-source"
              title="Sumber Informasi Lowongan"
              subtitle="Kanal pendaftaran yang paling efektif"
              allowedModes={['donut', 'bar', 'table']}
              defaultMode="donut"
              isFiltered={crossFilter?.key === 'sumber_info'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(sourceData, 'Kandidat')
                ) : mode === 'donut' ? (
                  <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                    <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartGradients />
                          <Tooltip content={renderCustomTooltip} />
                          <Pie
                            data={sourceData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="72%"
                            paddingAngle={2}
                            onClick={(d) => handleChartFilter('chart-source', 'sumber_info', d, 'Sumber')}
                            cursor="pointer"
                          >
                            {sourceData.map((_, idx) => (
                              <Cell key={idx} fill={GRADIENT_SLICE_IDS[idx % GRADIENT_SLICE_IDS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-black text-[#FF5A1F] dark:text-[#FF7A45] leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted mt-0.5">
                          Kandidat
                        </span>
                      </div>
                    </div>
                    <PieChartLegend
                      items={sourceData}
                      total={totalCount}
                      onItemClick={(name) => handleChartFilter('chart-source', 'sumber_info', name, 'Sumber')}
                      selectedName={crossFilter?.key === 'sumber_info' ? crossFilter.value : undefined}
                      className="flex-1 min-w-0"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sourceData}
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
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#orangeGradH)"
                        onClick={(d) => handleChartFilter('chart-source', 'sumber_info', d, 'Sumber')}
                        cursor="pointer"
                      >
                        {sourceData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'sumber_info' && crossFilter.value === d.name
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
                )
              }
            </ChartCard>

            {/* 4. Tren Pelamar Harian */}
            <ChartCard
              id="chart-trend"
              title="Tren Pelamar Harian"
              subtitle="Aktivitas berkas masuk harian"
              allowedModes={['bar', 'table']}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(
                    dailyTrendData.map((d) => ({ name: d.date, count: d.count })),
                    'Pelamar'
                  )
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyTrendData}
                      margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
                    >
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="shortDate"
                        tick={{ fontSize: 9, fill: '#4B6358' }}
                      />
                      <YAxis tick={{ fontSize: 9, fill: '#4B6358' }} allowDecimals={false} />
                      <Tooltip content={renderCustomTooltip} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#1F7A5C"
                        strokeWidth={2}
                        fill="url(#emeraldAreaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )
              }
            </ChartCard>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────────
            KATEGORI 2: Demografi & Profil (4 Grafik)
           ───────────────────────────────────────────────────────────── */}
        {activeCategory === 'demografi' && (
          <>
            {/* 1. Komposisi Gender */}
            <ChartCard
              id="chart-gender"
              title="Komposisi Gender"
              subtitle="Perbandingan pelamar pria & wanita"
              allowedModes={['donut', 'bar', 'table']}
              isFiltered={crossFilter?.key === 'gender'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(genderData, 'Kandidat')
                ) : mode === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genderData.map((d) => ({
                        ...d,
                        labelPercent: `${d.count} (${((d.count / totalCount) * 100).toFixed(0)}%)`,
                      }))}
                      layout="vertical"
                      margin={{ top: 2, right: 65, left: 10, bottom: 2 }}
                    >
                      <ChartGradients />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                        width={120}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                        onClick={(d) => handleChartFilter('chart-gender', 'gender', d, 'Gender')}
                        cursor="pointer"
                      >
                        {genderData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'gender' && crossFilter.value === d.name
                                ? 'url(#activeHighlightGrad)'
                                : d.name.toLowerCase().includes('laki')
                                ? 'url(#greenGradH)'
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
                ) : (
                  <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                    <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartGradients />
                          <Tooltip content={renderCustomTooltip} />
                          <Pie
                            data={genderData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="44%"
                            outerRadius="74%"
                            paddingAngle={3}
                            onClick={(d) => handleChartFilter('chart-gender', 'gender', d, 'Gender')}
                            cursor="pointer"
                          >
                            {genderData.map((d, idx) => (
                              <Cell
                                key={idx}
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-black text-text-heading dark:text-[#E7F5EF] leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[8.5px] font-bold text-text-muted mt-0.5">
                          Kandidat
                        </span>
                      </div>
                    </div>
                    <PieChartLegend
                      items={genderData.map((d) => ({
                        name: d.name,
                        count: d.count,
                        gradientClass: d.name.toLowerCase().includes('laki')
                          ? 'bg-gradient-to-r from-[#05473A] to-[#1F7A5C]'
                          : 'bg-gradient-to-r from-[#FF5A1F] to-[#FFA07A]',
                      }))}
                      total={totalCount}
                      onItemClick={(name) => handleChartFilter('chart-gender', 'gender', name, 'Gender')}
                      selectedName={crossFilter?.key === 'gender' ? crossFilter.value : undefined}
                      className="flex-1 min-w-0"
                    />
                  </div>
                )
              }
            </ChartCard>

            {/* 2. Distribusi Usia */}
            <ChartCard
              id="chart-age"
              title="Distribusi Usia Pelamar"
              subtitle="Kelompok umur kandidat"
              allowedModes={['bar', 'table']}
              isFiltered={crossFilter?.key === 'age_group'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(ageData, 'Kandidat')
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ageData}
                      margin={{ top: 16, right: 10, left: -25, bottom: 0 }}
                    >
                      <ChartGradients />
                      <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 9.5, fill: '#4B6358' }} allowDecimals={false} />
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        fill="url(#greenGradV)"
                        onClick={(d) => handleChartFilter('chart-age', 'age_group', d, 'Usia')}
                        cursor="pointer"
                      >
                        {ageData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'age_group' && crossFilter.value === d.name
                                ? 'url(#activeHighlightGrad)'
                                : 'url(#greenGradV)'
                            }
                          />
                        ))}
                        <LabelList
                          dataKey="labelPercent"
                          position="top"
                          offset={4}
                          fill="currentColor"
                          className="text-text-heading dark:text-[#E7F5EF] text-[9.5px] font-bold"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </ChartCard>

            {/* 3. Tingkat Pendidikan Terakhir */}
            <ChartCard
              id="chart-education"
              title="Tingkat Pendidikan Terakhir"
              subtitle="Kualifikasi jenjang pendidikan"
              allowedModes={['donut', 'bar', 'table']}
              defaultMode="donut"
              isFiltered={crossFilter?.key === 'candidate_education'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(educationData, 'Kandidat')
                ) : mode === 'donut' ? (
                  <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                    <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartGradients />
                          <Tooltip content={renderCustomTooltip} />
                          <Pie
                            data={educationData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="72%"
                            paddingAngle={2}
                            onClick={(d) => handleChartFilter('chart-edu', 'candidate_education', d, 'Pendidikan')}
                            cursor="pointer"
                          >
                            {educationData.map((_, idx) => (
                              <Cell key={idx} fill={GRADIENT_SLICE_IDS[idx % GRADIENT_SLICE_IDS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-black text-[#FF5A1F] dark:text-[#FF7A45] leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted mt-0.5">
                          Kandidat
                        </span>
                      </div>
                    </div>
                    <PieChartLegend
                      items={educationData}
                      total={totalCount}
                      onItemClick={(name) => handleChartFilter('chart-edu', 'candidate_education', name, 'Pendidikan')}
                      selectedName={crossFilter?.key === 'candidate_education' ? crossFilter.value : undefined}
                      className="flex-1 min-w-0"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={educationData}
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
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#greenGradH)"
                        onClick={(d) => handleChartFilter('chart-edu', 'candidate_education', d, 'Pendidikan')}
                        cursor="pointer"
                      >
                        {educationData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'candidate_education' && crossFilter.value === d.name
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
                )
              }
            </ChartCard>

            {/* 4. Status Pernikahan */}
            <ChartCard
              id="chart-marital"
              title="Status Pernikahan"
              subtitle="Lajang vs Menikah"
              allowedModes={['donut', 'bar', 'table']}
              isFiltered={crossFilter?.key === 'status_marital'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(maritalData, 'Kandidat')
                ) : mode === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={maritalData}
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
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#orangeGradH)"
                        onClick={(d) => handleChartFilter('chart-marital', 'status_marital', d, 'Status')}
                        cursor="pointer"
                      >
                        {maritalData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'status_marital' && crossFilter.value === d.name
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
                ) : (
                  <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                    <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartGradients />
                          <Tooltip content={renderCustomTooltip} />
                          <Pie
                            data={maritalData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="44%"
                            outerRadius="74%"
                            paddingAngle={3}
                            onClick={(d) => handleChartFilter('chart-marital', 'status_marital', d, 'Status')}
                            cursor="pointer"
                          >
                            {maritalData.map((_, idx) => (
                              <Cell key={idx} fill={GRADIENT_SLICE_IDS[idx % GRADIENT_SLICE_IDS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-black text-text-heading dark:text-[#E7F5EF] leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[8.5px] font-bold text-text-muted mt-0.5">
                          Status
                        </span>
                      </div>
                    </div>
                    <PieChartLegend
                      items={maritalData}
                      total={totalCount}
                      onItemClick={(name) => handleChartFilter('chart-marital', 'status_marital', name, 'Status')}
                      selectedName={crossFilter?.key === 'status_marital' ? crossFilter.value : undefined}
                      className="flex-1 min-w-0"
                    />
                  </div>
                )
              }
            </ChartCard>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────────
            KATEGORI 3: Kompensasi & Lokasi (4 Grafik)
           ───────────────────────────────────────────────────────────── */}
        {activeCategory === 'kompensasi' && (
          <>
            {/* 1. Ekspektasi Gaji per Posisi */}
            <ChartCard
              id="chart-salary"
              title="Ekspektasi Gaji per Posisi"
              subtitle={`Nominal ${salaryCalcType === 'avg' ? 'rata-rata' : 'median'} harapan kandidat`}
              allowedModes={['bar', 'table']}
              extraHeaderActions={
                <div className="flex items-center bg-[#F1F5F2] dark:bg-[#0A382E] p-0.5 rounded-md border border-[#E3EAE6] dark:border-[#0E4437] text-[10px]">
                  <button
                    onClick={() => setSalaryCalcType('avg')}
                    className={`px-1.5 py-0.5 rounded transition-all font-semibold ${
                      salaryCalcType === 'avg'
                        ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs'
                        : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Rata-rata
                  </button>
                  <button
                    onClick={() => setSalaryCalcType('median')}
                    className={`px-1.5 py-0.5 rounded transition-all font-semibold ${
                      salaryCalcType === 'median'
                        ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs'
                        : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Median
                  </button>
                </div>
              }
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(
                    salaryData.map((d) => ({ name: d.name, salary: d.salary })),
                    'Gaji'
                  )
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salaryData}
                      layout="vertical"
                      margin={{ top: 2, right: 65, left: 10, bottom: 2 }}
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
                        width={145}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="salary"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#amberGradH)"
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
                )
              }
            </ChartCard>

            {/* 2. Pengalaman Bidang F&B */}
            <ChartCard
              id="chart-fnb"
              title="Pengalaman Bidang F&B"
              subtitle="Latar belakang pengalaman restoran & F&B"
              allowedModes={['bar', 'table']}
              isFiltered={crossFilter?.key === 'pengalaman_fnb'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(fnbExpData, 'Kandidat')
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fnbExpData}
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
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#greenGradH)"
                        onClick={(d) => handleChartFilter('chart-fnb', 'pengalaman_fnb', d, 'Pengalaman')}
                        cursor="pointer"
                      >
                        {fnbExpData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'pengalaman_fnb' && crossFilter.value === d.name
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
                )
              }
            </ChartCard>

            {/* 3. Distribusi Domisili Kota */}
            <ChartCard
              id="chart-city"
              title="Distribusi Domisili Kota"
              subtitle={showAllCities ? 'Semua domisili kota pelamar' : 'Top 8 kota asal kandidat'}
              allowedModes={['bar', 'table']}
              isFiltered={crossFilter?.key === 'domisili_kota'}
              onClearFilter={() => setCrossFilter(null)}
              extraHeaderActions={
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="px-1.5 py-0.5 rounded bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading text-[10px] font-semibold border border-[#E3EAE6] dark:border-[#0E4437]"
                >
                  {showAllCities ? 'Top 8' : 'Semua'}
                </button>
              }
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(cityData, 'Kandidat')
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cityData}
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
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        fill="url(#orangeGradH)"
                        onClick={(d) => handleChartFilter('chart-city', 'domisili_kota', d, 'Kota')}
                        cursor="pointer"
                      >
                        {cityData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'domisili_kota' && crossFilter.value === d.name
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
                )
              }
            </ChartCard>

            {/* 4. Kategori Lowongan (Outlet vs Office) */}
            <ChartCard
              id="chart-category"
              title="Kategori Lowongan"
              subtitle="Proporsi penempatan kerja"
              allowedModes={['donut', 'bar', 'table']}
              isFiltered={crossFilter?.key === 'kategori_lowongan'}
              onClearFilter={() => setCrossFilter(null)}
            >
              {(mode) =>
                mode === 'table' ? (
                  renderTableData(categoryData, 'Kandidat')
                ) : mode === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      margin={{ top: 2, right: 65, left: 10, bottom: 2 }}
                    >
                      <ChartGradients />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                        width={100}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                        onClick={(d) => handleChartFilter('chart-cat', 'kategori_lowongan', d, 'Kategori')}
                        cursor="pointer"
                      >
                        {categoryData.map((d, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              crossFilter?.key === 'kategori_lowongan' && crossFilter.value === d.name
                                ? 'url(#activeHighlightGrad)'
                                : idx === 0
                                ? 'url(#orangeGradH)'
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
                ) : (
                  <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-0.5">
                    <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartGradients />
                          <Tooltip content={renderCustomTooltip} />
                          <Pie
                            data={categoryData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="44%"
                            outerRadius="74%"
                            paddingAngle={3}
                            onClick={(d) => handleChartFilter('chart-cat', 'kategori_lowongan', d, 'Kategori')}
                            cursor="pointer"
                          >
                            {categoryData.map((_, idx) => (
                              <Cell
                                key={idx}
                                fill={idx === 0 ? 'url(#sliceOrangeGrad)' : 'url(#sliceGreenGrad)'}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-black text-text-heading dark:text-[#E7F5EF] leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[8.5px] font-bold text-text-muted mt-0.5">
                          Kategori
                        </span>
                      </div>
                    </div>
                    <PieChartLegend
                      items={categoryData}
                      total={totalCount}
                      onItemClick={(name) => handleChartFilter('chart-cat', 'kategori_lowongan', name, 'Kategori')}
                      selectedName={crossFilter?.key === 'kategori_lowongan' ? crossFilter.value : undefined}
                      className="flex-1 min-w-0"
                    />
                  </div>
                )
              }
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
};
