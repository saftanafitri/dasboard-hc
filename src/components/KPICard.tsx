import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  valueColor?: string;
  isActive?: boolean;
  onClick?: () => void;
  tooltip?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  subtitle,
  icon,
  valueColor = 'text-[#FF5A1F] dark:text-[#FF7A45]',
  isActive = false,
  onClick,
  tooltip,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600; // ms
    const startValue = displayValue;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value]);

  const formattedDisplay =
    decimalPlaces > 0
      ? displayValue.toFixed(decimalPlaces).replace('.', ',')
      : Math.round(displayValue).toLocaleString('id-ID');

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      title={tooltip || (onClick ? (isActive ? 'Klik untuk melepas filter' : 'Klik untuk memfilter data dashboard') : undefined)}
      className={`relative py-1.5 px-2.5 rounded-xl transition-all duration-150 flex items-center justify-between cursor-pointer select-none group border-2 ${
        isActive
          ? 'border-[#FF5A1F] bg-gradient-to-br from-[#FF5A1F]/20 via-[#FF5A1F]/10 to-orange-500/10 dark:from-[#FF5A1F]/30 dark:via-[#2b170c] dark:to-[#1a0f07] shadow-xs'
          : 'border-orange-200/80 dark:border-orange-900/40 bg-gradient-to-br from-white via-orange-50/40 to-orange-100/30 dark:from-[#1b120c] dark:via-[#22160f] dark:to-[#170e08] hover:border-[#FF5A1F] hover:shadow-xs'
      }`}
    >
      <div className="flex-1 min-w-0 pr-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] dark:text-[#FFA07A] truncate">
            {title}
          </span>
          {isActive ? (
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF5A1F] text-white text-[8px] font-black tracking-tight shrink-0 shadow-2xs">
              AKTIF ✓
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400/80 dark:bg-orange-600 shrink-0 group-hover:scale-125 transition-transform" />
          )}
        </div>

        <div className="flex items-baseline space-x-1 leading-none mt-0.5">
          {prefix && <span className="text-[10px] font-bold text-orange-800/80 dark:text-orange-300">{prefix}</span>}
          <span className={`text-lg lg:text-xl font-black tracking-tight ${valueColor}`}>
            {formattedDisplay}
          </span>
          {suffix && <span className="text-[9.5px] font-bold text-orange-800/80 dark:text-orange-300">{suffix}</span>}
        </div>

        {subtitle && (
          <p className="text-[9px] font-medium text-orange-950/70 dark:text-orange-200/70 truncate mt-0.5 leading-tight" title={subtitle}>
            {subtitle}
          </p>
        )}
      </div>

      {icon && (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isActive
            ? 'bg-[#1F7A5C] text-white shadow-xs'
            : 'bg-[#1F7A5C]/15 text-[#1F7A5C] dark:bg-[#1F7A5C]/25 dark:text-emerald-300 group-hover:bg-[#1F7A5C] group-hover:text-white'
        }`}>
          {icon}
        </div>
      )}
    </motion.div>
  );
};
