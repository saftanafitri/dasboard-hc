import React, { useRef, useState } from 'react';
import { Download, BarChart2, PieChart, Table as TableIcon, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useDashboardStore } from '../store/useDashboardStore';

export type ChartViewMode = 'bar' | 'donut' | 'table';

interface ChartCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: (viewMode: ChartViewMode) => React.ReactNode;
  allowedModes?: ChartViewMode[];
  defaultMode?: ChartViewMode;
  extraHeaderActions?: React.ReactNode;
  isFiltered?: boolean;
  onClearFilter?: () => void;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  id,
  title,
  subtitle,
  children,
  allowedModes = ['bar', 'donut', 'table'],
  defaultMode,
  extraHeaderActions,
  isFiltered = false,
  onClearFilter,
  className = '',
}) => {
  const initialMode = defaultMode || allowedModes[0] || 'bar';
  const [viewMode, setViewMode] = useState<ChartViewMode>(initialMode);
  const [downloading, setDownloading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const addToast = useDashboardStore((s) => s.addToast);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#072A22' : '#FFFFFF',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_grafik.png`;
      link.href = dataUrl;
      link.click();
      addToast(`Grafik "${title}" berhasil diunduh sebagai PNG.`, 'success');
    } catch {
      addToast('Gagal mengunduh gambar grafik.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id={id}
      ref={chartRef}
      className={`relative flex flex-col p-2.5 rounded-lg bg-surface border border-[#E3EAE6] dark:border-[#0E4437] shadow-xs hover:shadow-soft transition-all duration-150 h-full min-h-0 overflow-hidden ${
        isFiltered ? 'ring-2 ring-[#FF5A1F]/80' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-[#E3EAE6] dark:border-[#0E4437] gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h4 className="text-xs font-bold text-text-heading dark:text-[#E7F5EF] tracking-tight truncate">
              {title}
            </h4>
            {isFiltered && (
              <span
                onClick={onClearFilter}
                className="cursor-pointer text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FF5A1F]/15 text-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-white transition-colors shrink-0"
                title="Batal filter"
              >
                Tersaring ✕
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-text-muted dark:text-[#82A796] truncate">{subtitle}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          {extraHeaderActions}

          {/* View mode toggle */}
          {allowedModes.length > 1 && (
            <div className="flex items-center bg-[#F1F5F2] dark:bg-[#0A382E] p-0.5 rounded-md border border-[#E3EAE6] dark:border-[#0E4437]">
              {allowedModes.includes('bar') && (
                <button
                  type="button"
                  onClick={() => setViewMode('bar')}
                  className={`p-1 rounded transition-all ${
                    viewMode === 'bar'
                      ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-heading'
                  }`}
                  title="Diagram Batang"
                >
                  <BarChart2 className="w-3 h-3" />
                </button>
              )}
              {allowedModes.includes('donut') && (
                <button
                  type="button"
                  onClick={() => setViewMode('donut')}
                  className={`p-1 rounded transition-all ${
                    viewMode === 'donut'
                      ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-heading'
                  }`}
                  title="Diagram Donat"
                >
                  <PieChart className="w-3 h-3" />
                </button>
              )}
              {allowedModes.includes('table') && (
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-[#1F7A5C] text-green-900 dark:text-white shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-heading'
                  }`}
                  title="Tabel Data"
                >
                  <TableIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="p-1 text-text-muted hover:text-green-700 dark:hover:text-emerald-300 hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E] rounded transition-colors"
            title="Unduh PNG"
          >
            {downloading ? (
              <Check className="w-3 h-3 text-emerald-500 animate-bounce" />
            ) : (
              <Download className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 w-full flex flex-col justify-center overflow-hidden">
        {children(viewMode)}
      </div>
    </div>
  );
};
