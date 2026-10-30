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
import { GateCandidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ChartCard } from '../ChartCard';
import { CHART_COLORS } from '../../theme/colors';
import { ChartGradients } from '../../theme/ChartGradients';
import { PieChartLegend } from '../PieChartLegend';
import { humanizeFieldName } from '../../lib/transformers';
import { Grid2X2, TableProperties, AlertOctagon } from 'lucide-react';

interface GateAnalyticsProps {
  gateCandidates: GateCandidate[];
}

type GateViewCategory = 'distribusi' | 'heatmap' | 'answers';

export const GateAnalytics: React.FC<GateAnalyticsProps> = ({ gateCandidates }) => {
  const crossFilter = useDashboardStore((s) => s.crossFilter);
  const toggleCrossFilter = useDashboardStore((s) => s.toggleCrossFilter);
  const setCrossFilter = useDashboardStore((s) => s.setCrossFilter);

  const [activeCategory, setActiveCategory] = useState<GateViewCategory>('distribusi');

  const handleChartFilter = (source: string, key: string, raw: any, labelPrefix?: string) => {
    const val =
      typeof raw === 'string'
        ? raw
        : raw?.rawField || raw?.name || raw?.step || raw?.payload?.rawField || raw?.payload?.name || raw?.payload?.step || '';
    if (val) {
      toggleCrossFilter({
        source,
        key,
        value: String(val),
        label: labelPrefix ? `${labelPrefix}: ${val}` : String(val),
      });
    }
  };

  const totalRecords = gateCandidates.length || 1;

  // Custom Tooltip
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = typeof data.value === 'number' ? data.value : 0;
      const pct = ((val / totalRecords) * 100).toFixed(1);

      return (
        <div className="p-2 bg-surface border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg shadow-xl text-xs space-y-0.5">
          <div className="font-bold text-text-heading dark:text-[#E7F5EF] text-[11px]">{label || data.name}</div>
          <div className="flex items-center space-x-1.5 text-[#FF5A1F] font-semibold text-[11px]">
            <span>{val.toLocaleString('id-ID')} tersaring</span>
            <span className="text-text-muted">({pct}%)</span>
          </div>
          <div className="text-[9px] text-text-muted">Klik untuk memfilter dashboard</div>
        </div>
      );
    }
    return null;
  };

  // 1. Alasan Tersaring (Top 5 for clean, un-cramped display)
  const reasonData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of gateCandidates) {
      map[g.field_name] = (map[g.field_name] || 0) + 1;
    }
    return Object.entries(map)
      .map(([rawField, count]) => {
        const full = humanizeFieldName(rawField);
        const pct = ((count / totalRecords) * 100).toFixed(0);
        return {
          rawField,
          name: full,
          shortName: full.length > 20 ? full.substring(0, 18) + '...' : full,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [gateCandidates, totalRecords]);

  // 2. Tersaring per Posisi (Top 5 strictly single-line labels)
  const positionGateData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of gateCandidates) {
      const pos = g.position_clean || '-';
      map[pos] = (map[pos] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalRecords) * 100).toFixed(0);
        return {
          name,
          shortName: name.length > 20 ? name.substring(0, 18) + '...' : name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [gateCandidates, totalRecords]);

  // 3. Kategori Posisi (Donut)
  const categoryGateData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of gateCandidates) {
      const cat = g.position_category || 'Lainnya';
      map[cat] = (map[cat] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [gateCandidates]);

  // 4. Tahap Rekrutmen yang Memicu Gate
  const stepGateData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of gateCandidates) {
      const step = g.step_number ? `Step ${g.step_number}` : 'Awal';
      map[step] = (map[step] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => {
        const pct = ((count / totalRecords) * 100).toFixed(0);
        return {
          name,
          count,
          labelPercent: `${count} (${pct}%)`,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [gateCandidates, totalRecords]);

  // 5. Heatmap Matriks: Posisi vs Top 5 Alasan
  const heatmapData = useMemo(() => {
    const topFields = reasonData.slice(0, 5).map((r) => r.rawField);
    const topPos = positionGateData.slice(0, 10).map((p) => p.name);

    const matrix: Record<string, Record<string, number>> = {};
    for (const p of topPos) {
      matrix[p] = {};
      for (const f of topFields) {
        matrix[p][f] = 0;
      }
    }

    let maxCellVal = 1;
    for (const g of gateCandidates) {
      const p = g.position_clean || '-';
      const f = g.field_name;
      if (matrix[p] && matrix[p][f] !== undefined) {
        matrix[p][f] += 1;
        if (matrix[p][f] > maxCellVal) maxCellVal = matrix[p][f];
      }
    }

    return { topFields, topPos, matrix, maxCellVal };
  }, [gateCandidates, reasonData, positionGateData]);

  // 6. Top 10 Jawaban Paling Sering Menyebabkan Gagal
  const topFailureAnswers = useMemo(() => {
    const map: Record<string, { field: string; value: string; count: number }> = {};
    for (const g of gateCandidates) {
      const key = `${g.field_name}:::${g.field_value || '-'}`;
      if (!map[key]) {
        map[key] = {
          field: g.field_name,
          value: g.field_value || '-',
          count: 0,
        };
      }
      map[key].count += 1;
    }
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [gateCandidates]);

  // Helper Table inside ChartCard
  const renderTableData = (data: { name: string; count: number }[], valLabel = 'Record Tersaring') => (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#F1F5F2] dark:bg-[#072A22] sticky top-0 text-text-muted">
          <tr>
            <th className="p-1.5 font-semibold">Kategori</th>
            <th className="p-1.5 font-semibold text-right">{valLabel}</th>
            <th className="p-1.5 font-semibold text-right">Rasio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-[#F1F5F2]/50 dark:hover:bg-[#0A382E]/40">
              <td className="p-1.5 font-medium truncate max-w-[150px]">{row.name}</td>
              <td className="p-1.5 text-right font-bold text-[#FF5A1F]">{row.count.toLocaleString('id-ID')}</td>
              <td className="p-1.5 text-right text-text-muted">
                {((row.count / totalRecords) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      {/* Sub-tab Switcher (ZERO SCROLL) */}
      <div className="flex items-center justify-between pb-1.5 mb-1 shrink-0 border-b border-[#E3EAE6] dark:border-[#0E4437]">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveCategory('distribusi')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeCategory === 'distribusi'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>1. Grafik Distribusi (2x2)</span>
          </button>

          <button
            onClick={() => setActiveCategory('heatmap')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeCategory === 'heatmap'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>2. Heatmap Posisi × Alasan</span>
          </button>

          <button
            onClick={() => setActiveCategory('answers')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeCategory === 'answers'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-text-heading'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>3. Top 10 Pemicu Kegagalan</span>
          </button>
        </div>

        <span className="text-[10px] text-text-muted hidden sm:inline-block">
          Tampilan 1-Layar Terstruktur
        </span>
      </div>

      {/* View 1: Distribusi 2x2 Grid (ZERO SCROLL) */}
      {activeCategory === 'distribusi' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-2 h-full overflow-hidden">
          {/* 1. Alasan Tersaring */}
          <ChartCard
            id="gate-chart-reasons"
            title="Alasan Utama Tersaring"
            subtitle="5 kriteria gate yang paling banyak menggugurkan berkas"
            allowedModes={['bar', 'table']}
            isFiltered={crossFilter?.key === 'field_name'}
            onClearFilter={() => setCrossFilter(null)}
          >
            {(mode) =>
              mode === 'table' ? (
                renderTableData(reasonData, 'Tersaring')
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reasonData}
                    layout="vertical"
                    margin={{ top: 4, right: 65, left: 10, bottom: 4 }}
                  >
                    <ChartGradients />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                      width={160}
                      interval={0}
                    />
                    <Tooltip content={renderCustomTooltip} />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      onClick={(d) => handleChartFilter('gate-reason', 'field_name', d, 'Alasan')}
                      cursor="pointer"
                    >
                      {reasonData.map((d, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            crossFilter?.key === 'field_name' &&
                            crossFilter.value === d.rawField
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

          {/* 2. Tersaring per Posisi (Screenshot 1 Fix: Clean single line, top 5, orange gradient) */}
          <ChartCard
            id="gate-chart-position"
            title="Tersaring per Posisi Lowongan"
            subtitle="Top 5 lowongan kerja dengan tingkat seleksi gate tertinggi"
            allowedModes={['bar', 'table']}
            isFiltered={crossFilter?.key === 'position_clean'}
            onClearFilter={() => setCrossFilter(null)}
          >
            {(mode) =>
              mode === 'table' ? (
                renderTableData(positionGateData, 'Tersaring')
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={positionGateData}
                    layout="vertical"
                    margin={{ top: 4, right: 65, left: 10, bottom: 4 }}
                  >
                    <ChartGradients />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                      width={155}
                      interval={0}
                    />
                    <Tooltip content={renderCustomTooltip} />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      onClick={(d) => handleChartFilter('gate-position', 'position_clean', d, 'Posisi')}
                      cursor="pointer"
                    >
                      {positionGateData.map((d, idx) => (
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

          {/* 3. Kategori Posisi (Screenshot 2 Fix: Gradient slices, center metric, clear legend) */}
          <ChartCard
            id="gate-chart-category"
            title="Kategori Posisi Tersaring"
            subtitle="Proporsi penolakan gate berdasarkan divisi"
            allowedModes={['donut', 'bar', 'table']}
            isFiltered={crossFilter?.key === 'position_category'}
            onClearFilter={() => setCrossFilter(null)}
          >
            {(mode) =>
              mode === 'table' ? (
                renderTableData(categoryGateData, 'Tersaring')
              ) : mode === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryGateData.map((c) => ({
                      ...c,
                      labelPercent: `${c.count} (${((c.count / totalRecords) * 100).toFixed(0)}%)`,
                    }))}
                    layout="vertical"
                    margin={{ top: 4, right: 65, left: 10, bottom: 4 }}
                  >
                    <ChartGradients />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }}
                      width={100}
                      interval={0}
                    />
                    <Tooltip content={renderCustomTooltip} />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      onClick={(d) => handleChartFilter('gate-cat', 'position_category', d, 'Kategori')}
                      cursor="pointer"
                    >
                      {categoryGateData.map((d, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            crossFilter?.key === 'position_category' && crossFilter.value === d.name
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
                <div className="w-full h-full flex flex-row items-center justify-between gap-2 overflow-hidden py-1">
                  <div className="flex-[1.15] min-w-0 h-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartGradients />
                        <Tooltip content={renderCustomTooltip} />
                        <Pie
                          data={categoryGateData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="44%"
                          outerRadius="74%"
                          paddingAngle={3}
                          onClick={(d) => handleChartFilter('gate-cat', 'position_category', d, 'Kategori')}
                          cursor="pointer"
                        >
                          {categoryGateData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={
                                idx === 0
                                  ? 'url(#sliceOrangeGrad)'
                                  : idx === 1
                                  ? 'url(#sliceGreenGrad)'
                                  : 'url(#sliceAmberGrad)'
                              }
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Statistic */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-base font-black text-[#FF5A1F] dark:text-[#FF7A45] leading-none">
                        {totalRecords}
                      </span>
                      <span className="text-[9px] font-bold text-text-muted mt-0.5">
                        Tersaring
                      </span>
                    </div>
                  </div>

                  {/* Clean Vertical Legend Beside Donut */}
                  <PieChartLegend
                    items={categoryGateData}
                    total={totalRecords}
                    onItemClick={(name) => handleChartFilter('gate-cat', 'position_category', name, 'Kategori')}
                    selectedName={crossFilter?.key === 'position_category' ? crossFilter.value : undefined}
                    className="flex-1 min-w-0"
                  />
                </div>
              )
            }
          </ChartCard>

          {/* 4. Tahap Pemicu Gate */}
          <ChartCard
            id="gate-chart-step"
            title="Tahap Pemicu Tersaring"
            subtitle="Tahap alur formulir di mana gate aktif"
            allowedModes={['bar', 'table']}
          >
            {(mode) =>
              mode === 'table' ? (
                renderTableData(stepGateData, 'Tersaring')
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stepGateData}
                    margin={{ top: 16, right: 10, left: -20, bottom: 0 }}
                  >
                    <ChartGradients />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#4B6358', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 9.5, fill: '#4B6358' }} allowDecimals={false} />
                    <Tooltip content={renderCustomTooltip} />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      fill="url(#orangeGradV)"
                    >
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
        </div>
      )}

      {/* View 2: Heatmap Matriks (Full-Height Contained) */}
      {activeCategory === 'heatmap' && (
        <div className="flex-1 min-h-0 flex flex-col p-3 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs overflow-hidden">
          <div className="pb-2 mb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
                Matriks Heatmap: Posisi Lowongan × Alasan Tersaring
              </h3>
              <p className="text-[10px] text-text-muted">
                Klik sel intensitas oranye untuk memfilter kandidat yang gugur pada kombinasi posisi dan alasan tertentu
              </p>
            </div>
            {crossFilter?.key === 'heatmap_pos_field' && (
              <button
                onClick={() => setCrossFilter(null)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5A1F] text-white hover:bg-[#e04e17]"
              >
                Hapus Filter Heatmap ✕
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F1F5F2] dark:bg-[#072A22] sticky top-0 text-text-muted shadow-xs">
                <tr>
                  <th className="p-2 font-bold min-w-[140px]">Posisi Lowongan</th>
                  {heatmapData.topFields.map((f) => (
                    <th key={f} className="p-2 font-bold text-center min-w-[100px]">
                      {humanizeFieldName(f)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
                {heatmapData.topPos.map((pos) => (
                  <tr key={pos} className="hover:bg-[#F1F5F2]/40 dark:hover:bg-[#0A382E]/30">
                    <td className="p-2 font-semibold text-text-heading dark:text-white max-w-[180px] truncate" title={pos}>
                      {pos}
                    </td>
                    {heatmapData.topFields.map((f) => {
                      const count = heatmapData.matrix[pos]?.[f] || 0;
                      const intensity = count / heatmapData.maxCellVal;
                      const cellKey = `${pos}:::${f}`;
                      const isSelected =
                        crossFilter?.key === 'heatmap_pos_field' && crossFilter.value === cellKey;

                      return (
                        <td key={f} className="p-1 text-center">
                          <button
                            onClick={() =>
                              toggleCrossFilter({
                                source: 'heatmap',
                                key: 'heatmap_pos_field',
                                value: cellKey,
                                label: `${pos} × ${humanizeFieldName(f)}`,
                              })
                            }
                            className={`w-full py-1.5 px-1 rounded-md font-bold transition-all text-xs ${
                              isSelected
                                ? 'ring-2 ring-[#FF5A1F] bg-[#FF5A1F] text-white'
                                : count === 0
                                ? 'bg-transparent text-gray-300 dark:text-gray-600'
                                : intensity > 0.6
                                ? 'bg-[#FF5A1F] text-white'
                                : intensity > 0.3
                                ? 'bg-[#FF5A1F]/60 text-white'
                                : 'bg-[#FF5A1F]/20 text-[#FF5A1F] dark:text-amber-300'
                            }`}
                            title={`${pos} • ${humanizeFieldName(f)}: ${count} penolakan`}
                          >
                            {count}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Top 10 Jawaban Pemicu Gagal (Full-Height Contained) */}
      {activeCategory === 'answers' && (
        <div className="flex-1 min-h-0 flex flex-col p-3 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs overflow-hidden">
          <div className="pb-2 mb-1.5 border-b border-[#E3EAE6] dark:border-[#0E4437] shrink-0">
            <h3 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF]">
              Top 10 Jawaban Paling Sering Memicu Gugur Gate
            </h3>
            <p className="text-[10px] text-text-muted">
              Kombinasi bidang pertanyaan dan jawaban spesifik kandidat yang memicu diskualifikasi otomatis
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F1F5F2] dark:bg-[#072A22] sticky top-0 text-text-muted shadow-xs">
                <tr>
                  <th className="p-2 font-bold w-10 text-center">#</th>
                  <th className="p-2 font-bold">Kriteria (Field Name)</th>
                  <th className="p-2 font-bold">Jawaban Pelamar (Field Value)</th>
                  <th className="p-2 font-bold text-right">Frekuensi Gugur</th>
                  <th className="p-2 font-bold text-right">Rasio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
                {topFailureAnswers.map((item, idx) => {
                  const pct = ((item.count / totalRecords) * 100).toFixed(1);
                  const isSelected =
                    crossFilter?.key === 'field_value' && crossFilter.value === item.value;

                  return (
                    <tr
                      key={idx}
                      onClick={() =>
                        toggleCrossFilter({
                          source: 'top-answers',
                          key: 'field_value',
                          value: item.value,
                          label: `Jawaban: ${item.value}`,
                        })
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#FF5A1F]/15 font-bold'
                          : 'hover:bg-[#F1F5F2]/50 dark:hover:bg-[#0A382E]/40'
                      }`}
                    >
                      <td className="p-2 text-center font-bold text-text-muted">{idx + 1}</td>
                      <td className="p-2 font-semibold text-green-900 dark:text-emerald-300">
                        {humanizeFieldName(item.field)}
                      </td>
                      <td className="p-2 text-text-heading dark:text-[#E7F5EF]">
                        <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[11px]">
                          {item.value}
                        </span>
                      </td>
                      <td className="p-2 text-right font-black text-[#FF5A1F]">
                        {item.count}
                      </td>
                      <td className="p-2 text-right font-semibold text-text-muted">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
