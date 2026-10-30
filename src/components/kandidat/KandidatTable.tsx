import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Users2,
  CheckSquare,
  Square
} from 'lucide-react';
import { Candidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatCurrencyShort, maskEmail, maskPhone } from '../../lib/transformers';

interface KandidatTableProps {
  candidates: Candidate[];
}

type SortField =
  | 'candidate_name'
  | 'position_clean'
  | 'candidate_age'
  | 'candidate_education'
  | 'domisili_kota'
  | 'pengalaman_fnb'
  | 'gaji_ekspetasi_num'
  | 'screening_score'
  | 'status_screening_candidate'
  | 'interview_date';

export const KandidatTable: React.FC<KandidatTableProps> = ({ candidates }) => {
  const setSelectedCandidateId = useDashboardStore((s) => s.setSelectedCandidateId);
  const compareCandidateIds = useDashboardStore((s) => s.compareCandidateIds);
  const toggleCompareCandidate = useDashboardStore((s) => s.toggleCompareCandidate);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const maskPii = useDashboardStore((s) => s.maskPii);
  const addToast = useDashboardStore((s) => s.addToast);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('candidate_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    nama: true,
    posisi: true,
    usia: true,
    pendidikan: true,
    domisili: true,
    pengalaman: true,
    gaji: true,
    screening: true,
    tahap: true,
    interview: true,
    aksi: true,
  });
  const [colPickerOpen, setColPickerOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
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
  }, [candidates, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(sortedCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCandidates.slice(start, start + pageSize);
  }, [sortedCandidates, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedCandidates.length) {
      setSelectedIds(new Set());
    } else {
      const all = new Set(paginatedCandidates.map((c) => c.id));
      setSelectedIds(all);
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Export CSV
  const handleExportCSV = (onlySelected = false) => {
    const dataToExport = onlySelected
      ? candidates.filter((c) => selectedIds.has(c.id))
      : candidates;

    if (dataToExport.length === 0) {
      addToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const headers = [
      'ID',
      'Nama Kandidat',
      'Posisi',
      'Penempatan/Outlet',
      'Screening Status',
      'Skor Screening',
      'Usia',
      'Pendidikan',
      'Domisili',
      'Pengalaman F&B',
      'Ekspektasi Gaji',
      'Tahap Rekrutmen',
      'Tanggal Interview',
      'Lokasi Interview',
      'No WA',
      'Email',
    ];

    const rows = dataToExport.map((c) => [
      c.id,
      `"${c.candidate_name}"`,
      `"${c.position_clean}"`,
      `"${c.outlet_clean}"`,
      c.screening_status,
      c.screening_score,
      c.candidate_age,
      `"${c.candidate_education}"`,
      `"${c.domisili_kota}"`,
      `"${c.pengalaman_fnb}"`,
      c.gaji_ekspetasi_num,
      `"${c.status_screening_candidate}"`,
      c.interview_date || '-',
      `"${c.interview_location_name || '-'}"`,
      `'${c.no_wa}`,
      c.email,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kandidat_lengkap_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Berhasil mengekspor ${dataToExport.length} data ke file CSV.`, 'success');
  };

  // Highlight search text helper
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
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-text-heading dark:text-[#E7F5EF] tracking-tight">
            Daftar Lengkap Kandidat
          </h3>
          <p className="text-[11px] text-text-muted">
            {paginatedCandidates.length} dari {candidates.length} kandidat tersaring
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Bulk Export Selected */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => handleExportCSV(true)}
              className="px-2.5 py-1 bg-[#1F7A5C] text-white rounded-lg text-xs font-semibold flex items-center space-x-1 hover:bg-[#18644b] transition-all shadow-xs"
            >
              <Download className="w-3 h-3" />
              <span>Ekspor Terpilih ({selectedIds.size})</span>
            </button>
          )}

          {/* Export All CSV */}
          <button
            onClick={() => handleExportCSV(false)}
            className="px-2.5 py-1 border border-[#E3EAE6] dark:border-[#0E4437] hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-heading dark:text-[#E7F5EF] rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Ekspor CSV</span>
          </button>

          {/* Column Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setColPickerOpen(!colPickerOpen)}
              className="px-2.5 py-1 border border-[#E3EAE6] dark:border-[#0E4437] hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] text-text-muted hover:text-text-heading rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Kolom</span>
            </button>

            {colPickerOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 p-2 rounded-xl bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xl space-y-1 text-xs">
                <div className="font-bold text-text-heading dark:text-white pb-1 border-b border-[#E3EAE6] dark:border-[#0E4437] text-[11px]">
                  Visibilitas Kolom
                </div>
                {Object.keys(visibleColumns).map((col) => (
                  <label
                    key={col}
                    className="flex items-center space-x-2 cursor-pointer text-text-muted hover:text-text-heading capitalize text-[11px]"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col as keyof typeof visibleColumns]}
                      onChange={(e) =>
                        setVisibleColumns({
                          ...visibleColumns,
                          [col]: e.target.checked,
                        })
                      }
                      className="rounded text-green-700 focus:ring-green-700"
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-[#E3EAE6] dark:border-[#0E4437]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F1F5F2] dark:bg-[#072A22] text-text-muted uppercase tracking-wider font-semibold border-b border-[#E3EAE6] dark:border-[#0E4437] shadow-xs">
            <tr>
              <th className="py-2 px-2.5 w-8">
                <button onClick={handleSelectAll} className="text-text-muted hover:text-green-700">
                  {selectedIds.size === paginatedCandidates.length && paginatedCandidates.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#1F7A5C]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              {visibleColumns.nama && (
                <th
                  onClick={() => handleSort('candidate_name')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Nama Kandidat</span>
                    {sortField === 'candidate_name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.posisi && (
                <th
                  onClick={() => handleSort('position_clean')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Posisi & Outlet</span>
                    {sortField === 'position_clean' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.usia && (
                <th
                  onClick={() => handleSort('candidate_age')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Usia</span>
                    {sortField === 'candidate_age' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.pendidikan && (
                <th
                  onClick={() => handleSort('candidate_education')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Pendidikan</span>
                    {sortField === 'candidate_education' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.domisili && (
                <th
                  onClick={() => handleSort('domisili_kota')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Domisili</span>
                    {sortField === 'domisili_kota' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.pengalaman && (
                <th
                  onClick={() => handleSort('pengalaman_fnb')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Pengalaman F&B</span>
                    {sortField === 'pengalaman_fnb' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.gaji && (
                <th
                  onClick={() => handleSort('gaji_ekspetasi_num')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Gaji Eksp.</span>
                    {sortField === 'gaji_ekspetasi_num' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.screening && (
                <th
                  onClick={() => handleSort('screening_score')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Screening</span>
                    {sortField === 'screening_score' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.tahap && (
                <th
                  onClick={() => handleSort('status_screening_candidate')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tahap</span>
                    {sortField === 'status_screening_candidate' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.interview && (
                <th
                  onClick={() => handleSort('interview_date')}
                  className="py-1.5 px-2 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tgl Interview</span>
                    {sortField === 'interview_date' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#1F7A5C]" /> : <ArrowDown className="w-3 h-3 text-[#1F7A5C]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.aksi && <th className="py-1.5 px-2 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3EAE6] dark:divide-[#0E4437]">
            {paginatedCandidates.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-text-muted">
                  Tidak ada kandidat yang memenuhi filter saat ini.
                </td>
              </tr>
            ) : (
              paginatedCandidates.map((c) => {
                const isChecked = selectedIds.has(c.id);
                const isCompared = compareCandidateIds.includes(c.id);

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCandidateId(c.id)}
                    className="hover:bg-[#F1F5F2]/60 dark:hover:bg-[#072A22]/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 px-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleSelect(c.id)}
                        className="text-text-muted hover:text-green-700"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#1F7A5C]" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {visibleColumns.nama && (
                      <td className="py-1.5 px-2">
                        <div className="font-bold text-text-heading dark:text-[#E7F5EF] flex items-center space-x-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#1F7A5C] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                            {c.candidate_name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[140px] text-[11px]">{highlightSearch(c.candidate_name)}</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.posisi && (
                      <td className="py-1.5 px-2">
                        <div className="font-semibold text-text-heading dark:text-white truncate max-w-[160px] text-[11px]">
                          {highlightSearch(c.position_clean)}
                        </div>
                        <div className="text-[9.5px] text-text-muted truncate max-w-[160px]">
                          {c.outlet_clean}
                        </div>
                      </td>
                    )}

                    {visibleColumns.usia && (
                      <td className="py-1.5 px-2 text-text-muted font-medium text-[11px]">{c.candidate_age} th</td>
                    )}

                    {visibleColumns.pendidikan && (
                      <td className="py-1.5 px-2 text-text-muted truncate max-w-[100px] text-[11px]">
                        {c.candidate_education}
                      </td>
                    )}

                    {visibleColumns.domisili && (
                      <td className="py-1.5 px-2 text-text-muted truncate max-w-[100px] text-[11px]">
                        {highlightSearch(c.domisili_kota || c.candidate_domicile)}
                      </td>
                    )}

                    {visibleColumns.pengalaman && (
                      <td className="py-1.5 px-2 text-text-muted text-[10.5px] truncate max-w-[120px]">
                        {c.pengalaman_fnb}
                      </td>
                    )}

                    {visibleColumns.gaji && (
                      <td className="py-1.5 px-2 font-semibold text-[#FF5A1F] whitespace-nowrap text-[11px]">
                        {formatCurrencyShort(c.gaji_ekspetasi_num)}
                      </td>
                    )}

                    {visibleColumns.screening && (
                      <td className="py-1.5 px-2">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9.5px] font-bold ${
                            c.screening_status === 'Lolos'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          }`}
                        >
                          {c.screening_status} ({c.screening_score})
                        </span>
                      </td>
                    )}

                    {visibleColumns.tahap && (
                      <td className="py-1.5 px-2">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-[#F1F5F2] dark:bg-[#0A382E] text-green-900 dark:text-emerald-300 border border-[#E3EAE6] dark:border-[#0E4437] truncate max-w-[110px]">
                          {c.status_screening_candidate}
                        </span>
                      </td>
                    )}

                    {visibleColumns.interview && (
                      <td className="py-1.5 px-2 text-text-muted whitespace-nowrap text-[10.5px]">
                        {c.interview_date ? (
                          <span className="flex items-center space-x-1 text-blue-700 dark:text-blue-400 font-medium">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{c.interview_date}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    )}

                    {visibleColumns.aksi && (
                      <td className="py-1.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick compare button */}
                          <button
                            onClick={() => toggleCompareCandidate(c.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isCompared
                                ? 'bg-[#1F7A5C] text-white border-transparent'
                                : 'border-[#E3EAE6] dark:border-[#0E4437] text-text-muted hover:text-green-700'
                            }`}
                            title={isCompared ? 'Hapus perbandingan' : 'Bandingkan kandidat'}
                          >
                            <Users2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail button */}
                          <button
                            onClick={() => setSelectedCandidateId(c.id)}
                            className="p-1.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] text-text-muted hover:text-green-700 hover:bg-white dark:hover:bg-[#0A382E] transition-colors"
                            title="Buka Drawer Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
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
