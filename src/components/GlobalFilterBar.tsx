import React from 'react';
import {
  Calendar,
  Briefcase,
  MapPin,
  Tag,
  Layers,
  Search,
  RotateCcw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Command,
  X,
  Filter
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useFilteredData } from '../hooks/useFilteredData';

export const GlobalFilterBar: React.FC = () => {
  const activePage = useDashboardStore((s) => s.activePage);
  const datePreset = useDashboardStore((s) => s.datePreset);
  const setDatePreset = useDashboardStore((s) => s.setDatePreset);
  const selectedPosition = useDashboardStore((s) => s.selectedPosition);
  const setSelectedPosition = useDashboardStore((s) => s.setSelectedPosition);
  const selectedOutlet = useDashboardStore((s) => s.selectedOutlet);
  const setSelectedOutlet = useDashboardStore((s) => s.setSelectedOutlet);
  const selectedCategory = useDashboardStore((s) => s.selectedCategory);
  const setSelectedCategory = useDashboardStore((s) => s.setSelectedCategory);
  const selectedStage = useDashboardStore((s) => s.selectedStage);
  const setSelectedStage = useDashboardStore((s) => s.setSelectedStage);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const crossFilter = useDashboardStore((s) => s.crossFilter);
  const setCrossFilter = useDashboardStore((s) => s.setCrossFilter);
  const resetAllFilters = useDashboardStore((s) => s.resetAllFilters);

  const maskPii = useDashboardStore((s) => s.maskPii);
  const toggleMaskPii = useDashboardStore((s) => s.toggleMaskPii);
  const darkMode = useDashboardStore((s) => s.darkMode);
  const toggleDarkMode = useDashboardStore((s) => s.toggleDarkMode);
  const setCommandPaletteOpen = useDashboardStore((s) => s.setCommandPaletteOpen);

  const { filterOptions } = useFilteredData();

  // Active filter chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  if (datePreset !== 'all') {
    const label =
      datePreset === 'today'
        ? 'Hari Ini'
        : datePreset === '7days'
        ? '7 Hari'
        : '30 Hari';
    activeChips.push({
      id: 'date',
      label,
      onRemove: () => setDatePreset('all'),
    });
  }

  if (selectedPosition && selectedPosition !== 'Semua') {
    activeChips.push({
      id: 'pos',
      label: selectedPosition,
      onRemove: () => setSelectedPosition(null),
    });
  }

  if (selectedOutlet && selectedOutlet !== 'Semua') {
    activeChips.push({
      id: 'outlet',
      label: selectedOutlet,
      onRemove: () => setSelectedOutlet(null),
    });
  }

  if (selectedCategory && selectedCategory !== 'Semua') {
    activeChips.push({
      id: 'cat',
      label: selectedCategory,
      onRemove: () => setSelectedCategory(null),
    });
  }

  if (activePage === 'kandidat' && selectedStage && selectedStage !== 'Semua') {
    activeChips.push({
      id: 'stage',
      label: selectedStage,
      onRemove: () => setSelectedStage(null),
    });
  }

  if (crossFilter) {
    activeChips.push({
      id: 'cross',
      label: crossFilter.label || crossFilter.value,
      onRemove: () => setCrossFilter(null),
    });
  }

  if (searchQuery.trim()) {
    activeChips.push({
      id: 'search',
      label: `"${searchQuery}"`,
      onRemove: () => setSearchQuery(''),
    });
  }

  return (
    <div className="shrink-0 z-20 w-full bg-surface/95 backdrop-blur-md border-b border-[#E3EAE6] dark:border-[#0E4437] transition-colors py-1 px-3 lg:px-4">
      <div className="flex flex-wrap items-center justify-between gap-1">
        {/* Left: Filters Row */}
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          {/* Date Preset Buttons */}
          <div className="flex items-center bg-[#F1F5F2] dark:bg-[#0A382E] p-0.5 rounded-lg border border-[#E3EAE6] dark:border-[#0E4437] text-[11px]">
            {(['all', 'today', '7days', '30days'] as const).map((preset) => {
              const label =
                preset === 'all'
                  ? 'Semua'
                  : preset === 'today'
                  ? 'Hari Ini'
                  : preset === '7days'
                  ? '7 Hari'
                  : '30 Hari';
              const isSelected = datePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setDatePreset(preset)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs'
                      : 'text-text-muted hover:text-text-heading'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Position Select */}
          <div className="relative">
            <select
              aria-label="Filter posisi"
              value={selectedPosition || 'Semua'}
              onChange={(e) => setSelectedPosition(e.target.value === 'Semua' ? null : e.target.value)}
              className="pl-6 pr-5 py-1 bg-[#F1F5F2] dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg text-[11px] font-semibold text-text-heading dark:text-[#E7F5EF] focus:outline-hidden cursor-pointer appearance-none max-w-[130px] truncate"
            >
              <option value="Semua">Posisi: Semua</option>
              {filterOptions.positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <Briefcase className="w-3 h-3 text-text-muted absolute left-2 top-2 pointer-events-none" />
          </div>

          {/* Outlet Select */}
          <div className="relative">
            <select
              aria-label="Filter outlet"
              value={selectedOutlet || 'Semua'}
              onChange={(e) => setSelectedOutlet(e.target.value === 'Semua' ? null : e.target.value)}
              className="pl-6 pr-5 py-1 bg-[#F1F5F2] dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg text-[11px] font-semibold text-text-heading dark:text-[#E7F5EF] focus:outline-hidden cursor-pointer appearance-none max-w-[125px] truncate"
            >
              <option value="Semua">Outlet: Semua</option>
              {filterOptions.outlets.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <MapPin className="w-3 h-3 text-text-muted absolute left-2 top-2 pointer-events-none" />
          </div>

          {/* Category Select */}
          <div className="relative">
            <select
              aria-label="Filter kategori"
              value={selectedCategory || 'Semua'}
              onChange={(e) => setSelectedCategory(e.target.value === 'Semua' ? null : e.target.value)}
              className="pl-6 pr-5 py-1 bg-[#F1F5F2] dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg text-[11px] font-semibold text-text-heading dark:text-[#E7F5EF] focus:outline-hidden cursor-pointer appearance-none max-w-[110px] truncate"
            >
              <option value="Semua">Kategori</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Tag className="w-3 h-3 text-text-muted absolute left-2 top-2 pointer-events-none" />
          </div>

          {/* Stage Select (Only on Kandidat page) */}
          {activePage === 'kandidat' && (
            <div className="relative">
              <select
                aria-label="Filter tahap"
                value={selectedStage || 'Semua'}
                onChange={(e) => setSelectedStage(e.target.value === 'Semua' ? null : e.target.value)}
                className="pl-6 pr-5 py-1 bg-[#F1F5F2] dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg text-[11px] font-semibold text-text-heading dark:text-[#E7F5EF] focus:outline-hidden cursor-pointer appearance-none max-w-[120px] truncate"
              >
                <option value="Semua">Tahap: Semua</option>
                {filterOptions.stages.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <Layers className="w-3 h-3 text-text-muted absolute left-2 top-2 pointer-events-none" />
            </div>
          )}

          {/* Inline Active Chips */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] no-scrollbar pl-1 border-l border-[#E3EAE6] dark:border-[#0E4437]">
              {activeChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center space-x-1 pl-2 pr-1 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5C]/15 text-green-900 dark:text-emerald-200 border border-[#1F7A5C]/30 shrink-0"
                >
                  <span className="truncate max-w-[90px]">{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="p-0.5 hover:bg-[#1F7A5C]/30 rounded-full"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              <button
                onClick={resetAllFilters}
                className="px-1.5 py-0.5 text-[10px] font-bold text-[#FF5A1F] hover:bg-[#FF5A1F]/10 rounded flex items-center shrink-0"
                title="Reset semua filter"
              >
                <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Search + Quick Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <input
              id="global-search-input"
              type="text"
              placeholder="Cari kandidat... [/]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1 w-36 sm:w-48 bg-[#F1F5F2] dark:bg-[#0A382E] border border-[#E3EAE6] dark:border-[#0E4437] rounded-lg text-[11px] font-medium text-text-heading dark:text-[#E7F5EF] focus:outline-hidden"
            />
            <Search className="w-3 h-3 text-text-muted absolute left-2 top-2" />
          </div>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1 rounded-lg bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-green-700 dark:hover:text-emerald-400 border border-[#E3EAE6] dark:border-[#0E4437]"
            title="Command Palette (Ctrl + K)"
          >
            <Command className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleMaskPii}
            className={`p-1 rounded-lg border transition-colors ${
              maskPii
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                : 'bg-[#F1F5F2] dark:bg-[#0A382E] border-[#E3EAE6] dark:border-[#0E4437] text-text-muted hover:text-text-heading'
            }`}
            title={maskPii ? 'Tampilkan data sensitif' : 'Samarkan data pribadi (WA & email)'}
          >
            {maskPii ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-1 rounded-lg bg-[#F1F5F2] dark:bg-[#0A382E] text-text-muted hover:text-green-700 dark:hover:text-emerald-400 border border-[#E3EAE6] dark:border-[#0E4437]"
            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
