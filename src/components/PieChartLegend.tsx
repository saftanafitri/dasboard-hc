import React from 'react';

export interface PieLegendItem {
  name: string;
  count: number;
  gradientClass?: string;
}

interface PieChartLegendProps {
  items: PieLegendItem[];
  total: number;
  onItemClick?: (name: string) => void;
  selectedName?: string;
  layout?: 'vertical' | 'horizontal';
  title?: string;
  className?: string;
}

/**
 * Standard interactive legend for all Pie / Donut charts
 * Displays vertically beside the pie chart:
 * [Header: Penjelasan Warna]
 * ● Name  Count (XX%)
 */
export const PieChartLegend: React.FC<PieChartLegendProps> = ({
  items,
  total,
  onItemClick,
  selectedName,
  layout = 'vertical',
  title = 'Penjelasan Warna',
  className = '',
}) => {
  const safeTotal = total || 1;

  const defaultDotGradients = [
    'bg-gradient-to-r from-[#FF5A1F] to-[#FFA07A]',
    'bg-gradient-to-r from-[#05473A] to-[#1F7A5C]',
    'bg-gradient-to-r from-[#D97706] to-[#FBBF24]',
    'bg-gradient-to-r from-[#0B5D48] to-[#34D399]',
    'bg-gradient-to-r from-[#E04E17] to-[#FF7D4D]',
    'bg-gradient-to-r from-[#1F7A5C] to-[#05473A]',
  ];

  if (layout === 'horizontal') {
    return (
      <div
        className={`flex items-center justify-center gap-2 pt-1 border-t border-[#E3EAE6]/70 dark:border-[#0E4437]/70 shrink-0 text-[10.5px] flex-wrap max-h-12 overflow-y-auto no-scrollbar ${className}`}
      >
        {items.map((item, idx) => {
          const pct = ((item.count / safeTotal) * 100).toFixed(0);
          const isSelected = selectedName === item.name;
          const dotBg = item.gradientClass || defaultDotGradients[idx % defaultDotGradients.length];
          const cleanName = item.name.replace(/[:\s]+$/, '');

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onItemClick?.(item.name)}
              className={`flex items-center space-x-1.5 transition-all py-0.5 px-1.5 rounded-md ${
                isSelected
                  ? 'bg-[#FF5A1F]/15 font-black ring-1 ring-[#FF5A1F]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 font-semibold'
              }`}
              title={`Klik untuk filter ${cleanName}: ${item.count} (${pct}%)`}
            >
              <span className={`w-2.5 h-2.5 rounded-[3px] shrink-0 ${dotBg}`} />
              <span className="text-text-heading dark:text-[#E7F5EF] truncate max-w-[120px]">
                {cleanName}
              </span>
              <span className="font-black text-[#FF5A1F] dark:text-[#FF7A45]">
                {item.count.toLocaleString('id-ID')}
              </span>
              <span className="text-text-muted text-[9.5px]">({pct}%)</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Vertical Legend Stack beside the pie chart (Right-hand side "Penjelasan Warna")
  return (
    <div
      className={`flex flex-col justify-center h-full min-w-0 border-l border-[#E3EAE6]/80 dark:border-[#0E4437]/80 pl-2.5 pr-1 py-1 text-[10.5px] ${className}`}
    >
      {/* Header Penjelasan Warna */}
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#E3EAE6]/60 dark:border-[#0E4437]/60 shrink-0">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5C] shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-[#A8C7B8] truncate">
            {title}
          </span>
        </div>
        <span className="text-[9px] font-semibold text-text-muted shrink-0 pl-1">
          {items.length} Kat.
        </span>
      </div>

      {/* Item rows */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar flex flex-col justify-center">
        {items.map((item, idx) => {
          const pct = ((item.count / safeTotal) * 100).toFixed(0);
          const isSelected = selectedName === item.name;
          const dotBg = item.gradientClass || defaultDotGradients[idx % defaultDotGradients.length];
          const cleanName = item.name.replace(/[:\s]+$/, '');

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onItemClick?.(item.name)}
              className={`w-full flex items-center justify-between gap-1.5 transition-all py-0.5 px-1.5 rounded-md text-left ${
                isSelected
                  ? 'bg-[#FF5A1F]/15 font-black ring-1 ring-[#FF5A1F]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 font-semibold'
              }`}
              title={`Klik untuk filter ${cleanName}: ${item.count} (${pct}%)`}
            >
              <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                <span className={`w-2.5 h-2.5 rounded-[3px] shrink-0 ${dotBg} shadow-2xs`} />
                <span
                  className="text-text-heading dark:text-[#E7F5EF] truncate text-[10px] leading-tight"
                  title={cleanName}
                >
                  {cleanName}
                </span>
              </div>
              <div className="flex items-center space-x-1 shrink-0 text-[10px] whitespace-nowrap pl-1">
                <span className="font-black text-[#FF5A1F] dark:text-[#FF7A45]">
                  {item.count.toLocaleString('id-ID')}
                </span>
                <span className="text-text-muted text-[9px] font-medium">({pct}%)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
