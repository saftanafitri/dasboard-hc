import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  CopyCheck,
  Filter
} from 'lucide-react';
import { GateCandidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { maskEmail } from '../../lib/transformers';

interface GateTableProps {
  gateCandidates: GateCandidate[];
}

type SortField =
  | 'user_name'
  | 'user_email'
  | 'position_clean'
  | 'step_number'
  | 'field_name_label'
  | 'field_value'
  | 'syarat_lolos_gate'
  | 'aturan_gate_tipe'
  | 'created_at';

export const GateTable: React.FC<GateTableProps> = ({ gateCandidates }) => {
  const setSelectedGateCandidateId = useDashboardStore((s) => s.setSelectedGateCandidateId);
  const maskPii = useDashboardStore((s) => s.maskPii);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const addToast = useDashboardStore((s) => s.addToast);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Deduplication toggle: "Dedupe per email + field"
  const [dedupeActive, setDedupeActive] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Deduped dataset
  const processedData = useMemo(() => {
    let dataset = gateCandidates;
    if (dedupeActive) {
      const seen = new Set<string>();
      dataset = dataset.filter((item) => {
        const key = `${(item.user_email || '').toLowerCase()}::${item.field_name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return [...dataset].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comp = aVal.localeCompare(bVal, 'id-ID', { numeric: true });
        return sortDirection === 'asc' ? comp : -comp;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [gateCandidates, dedupeActive, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (processedData.length === 0) {
      addToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const headers = [
      'ID',
      'Nama Kandidat',
      'Email',
      'Posisi',
      'Step',
      'Field Kriteria',
      'Jawaban Kandidat',
      'Syarat Lolos',
      'Tipe Aturan',
      'Waktu Evaluasi',
    ];

    const rows = processedData.map((g) => [
      g.id,
      `"${g.user_name}"`,
      g.user_email,
      `"${g.position_name}"`,
      g.step_number,
      `"${g.field_name_label}"`,
      `"${g.field_value}"`,
      `"${g.syarat_lolos_gate}"`,
      g.aturan_gate_tipe,
      `"${g.created_at_formatted}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kandidat_terfilter_gate_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Berhasil mengekspor ${processedData.length} baris data gate.`, 'success');
  };

  const highlightSearch = (text: string | null | undefined) => {
    if (!text) return '-';
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-600/50 text-black dark:text-white px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-3 rounded-xl bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-text-heading dark:text-[#E7F5EF] tracking-tight">
            Log Evaluasi Gate Seleksi
          </h3>
          <p className="text-[11px] text-text-muted">
            {paginatedData.length} dari {processedData.length} baris (
            {dedupeActive ? 'Deduplikasi Aktif' : 'Semua Percobaan'})
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Dedupe Toggle */}
          <button
            onClick={() => {
              setDedupeActive(!dedupeActive);
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors border ${
              dedupeActive
                ? 'bg-[#1F7A5C] text-white border-transparent'
                : 'border-[#E3EAE6] dark:border-[#0E4437] text-text-muted hover:text-text-heading'
            }`}
          >
            <CopyCheck className="w-3 h-3" />
            <span>Dedupe per Email + Field</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 border border-[#E3EAE6] dark:border-[#0E4437] hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-[#E3EAE6] dark:border-[#0E4437]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F1F5F2] dark:bg-[#072A22] text-text-muted uppercase tracking-wider font-semibold border-b border-[#E3EAE6] dark:border-[#0E4437] shadow-xs">
            <tr>
              <th
                onClick={() => handleSort('user_name')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700"
              >
                <div className="flex items-center space-x-1">
                  <span>Nama Kandidat</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('user_email')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700"
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('position_clean')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700"
              >
                <div className="flex items-center space-x-1">
                  <span>Posisi</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('step_number')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700 text-center"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Step</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('field_name_label')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700"
              >
                <div className="flex items-center space-x-1">
                  <span>Field Kriteria</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('field_value')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700"
              >
                <div className="flex items-center space-x-1">
                  <span>Jawaban Kandidat</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th className="py-1.5 px-2">Syarat Lolos</th>
              <th className="py-1.5 px-2">Tipe Aturan</th>
              <th
                onClick={() => handleSort('created_at')}
                className="py-1.5 px-2 cursor-pointer hover:text-green-700"
              >
                <div className="flex items-center space-x-1">
                  <span>Waktu</span>
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
              <th className="py-1.5 px-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-text-muted">
                  Tidak ada data gate yang sesuai filter.
                </td>
              </tr>
            ) : (
              paginatedData.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => setSelectedGateCandidateId(g.id)}
                  className="hover:bg-[#F1F5F2]/60 dark:hover:bg-[#072A22]/50 cursor-pointer transition-colors"
                >
                  <td className="py-1.5 px-2 font-bold text-text-heading dark:text-[#E7F5EF] max-w-[130px] truncate text-[11px]">
                    {highlightSearch(g.user_name)}
                  </td>
                  <td className="py-1.5 px-2 text-text-muted max-w-[130px] truncate text-[11px]">
                    {maskPii ? maskEmail(g.user_email) : highlightSearch(g.user_email)}
                  </td>
                  <td className="py-1.5 px-2 font-semibold text-text-heading dark:text-white max-w-[150px] truncate text-[11px]">
                    {highlightSearch(g.position_name)}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-[#FF5A1F]/10 text-[#FF5A1F]">
                      Step {g.step_number}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-green-900 dark:text-emerald-300 font-semibold max-w-[130px] truncate text-[11px]">
                    {highlightSearch(g.field_name_label)}
                  </td>
                  <td className="py-1.5 px-2 max-w-[140px] truncate">
                    <span className="px-1.5 py-0.2 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold text-[10.5px]">
                      {highlightSearch(g.field_value)}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-text-muted max-w-[110px] truncate text-[10.5px]">
                    {g.syarat_lolos_gate || '-'}
                  </td>
                  <td className="py-1.5 px-2 text-text-muted text-[10.5px] whitespace-nowrap">
                    {g.aturan_gate_tipe || '-'}
                  </td>
                  <td className="py-1.5 px-2 text-text-muted whitespace-nowrap text-[10.5px]">
                    {g.created_at_formatted}
                  </td>
                  <td className="py-1.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedGateCandidateId(g.id)}
                      className="p-1 rounded-md border border-[#E3EAE6] dark:border-[#0E4437] text-text-muted hover:text-green-700 hover:bg-white dark:hover:bg-[#0A382E]"
                      title="Lihat Detail Gate"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <span>Tampilkan per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2 bg-[#F1F5F2] dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg text-xs font-semibold text-text-heading dark:text-[#E7F5EF] focus:outline-hidden"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-text-muted">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] bg-surface text-text-muted hover:text-text-heading disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] bg-surface text-text-muted hover:text-text-heading disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
