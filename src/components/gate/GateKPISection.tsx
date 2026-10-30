import React, { useMemo } from 'react';
import { FilterX, Users, Briefcase, AlertTriangle, Percent } from 'lucide-react';
import { GateCandidate, Candidate } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { KPICard } from '../KPICard';
import { humanizeFieldName } from '../../lib/transformers';

interface GateKPISectionProps {
  gateCandidates: GateCandidate[];
  candidates: Candidate[];
}

export const GateKPISection: React.FC<GateKPISectionProps> = ({
  gateCandidates,
  candidates,
}) => {
  const crossFilter = useDashboardStore((s) => s.crossFilter);
  const toggleCrossFilter = useDashboardStore((s) => s.toggleCrossFilter);
  const setCrossFilter = useDashboardStore((s) => s.setCrossFilter);

  const totalRecords = gateCandidates.length;

  // Distinct emails in gate
  const uniqueEmails = useMemo(() => {
    const emails = new Set(gateCandidates.map((g) => g.user_email).filter(Boolean));
    return emails.size;
  }, [gateCandidates]);

  // Affected positions
  const affectedPositions = useMemo(() => {
    const pos = new Set(gateCandidates.map((g) => g.position_clean).filter((p) => p && p !== '-'));
    return pos.size;
  }, [gateCandidates]);

  // Top failure reason (top field_name)
  const topReason = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const g of gateCandidates) {
      countMap[g.field_name] = (countMap[g.field_name] || 0) + 1;
    }
    let maxField = '-';
    let maxCount = 0;
    for (const [f, cnt] of Object.entries(countMap)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        maxField = f;
      }
    }
    return {
      field: maxField,
      label: humanizeFieldName(maxField),
      count: maxCount,
    };
  }, [gateCandidates]);

  // Percentage tersaring vs total pelamar (Sheet 1 vs Sheet 2 via email)
  const filterPercentage = useMemo(() => {
    // Total applicants pool: distinct emails from both sheet 1 and sheet 2
    const allEmails = new Set<string>();
    candidates.forEach((c) => {
      if (c.email) allEmails.add(c.email.toLowerCase().trim());
    });
    gateCandidates.forEach((g) => {
      if (g.user_email) allEmails.add(g.user_email.toLowerCase().trim());
    });

    const totalUniqueApplicants = allEmails.size || (candidates.length + uniqueEmails) || 1;
    const pct = (uniqueEmails / totalUniqueApplicants) * 100;
    return Math.min(100, Math.round(pct));
  }, [gateCandidates, candidates, uniqueEmails]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-0.5">
      {/* 1. Total Record Tersaring */}
      <KPICard
        title="Total Record Tersaring"
        value={totalRecords}
        subtitle="Jumlah penolakan gate tercatat"
        icon={<FilterX className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter === null}
        onClick={() => setCrossFilter(null)}
        tooltip="Klik untuk reset / tampilkan seluruh record gate"
      />

      {/* 2. Kandidat Unik */}
      <KPICard
        title="Kandidat Unik Terkena"
        value={uniqueEmails}
        subtitle="Klik: filter email terdaftar"
        icon={<Users className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'has_email'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi-gate',
            key: 'has_email',
            value: 'yes',
            label: 'Kandidat: Email Terdaftar',
          })
        }
        tooltip="Klik untuk memfilter kandidat unik dengan email valid"
      />

      {/* 3. Posisi Terdampak */}
      <KPICard
        title="Posisi Terdampak"
        value={affectedPositions}
        subtitle="Klik: filter posisi terdata"
        icon={<Briefcase className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'has_position'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi-gate',
            key: 'has_position',
            value: 'yes',
            label: 'Posisi: Terdampak Gate',
          })
        }
        tooltip="Klik untuk memfilter record dengan posisi spesifik"
      />

      {/* 4. Alasan Terbanyak */}
      <KPICard
        title="Alasan Terbanyak"
        value={topReason.count}
        subtitle={topReason.label}
        icon={<AlertTriangle className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'field_name' && crossFilter.value === topReason.field}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi-gate',
            key: 'field_name',
            value: topReason.field,
            label: `Alasan: ${topReason.label}`,
          })
        }
        tooltip={`Klik untuk memfilter alasan: ${topReason.label}`}
      />

      {/* 5. Persentase Tersaring */}
      <KPICard
        title="Rasio Tersaring"
        value={filterPercentage}
        suffix="%"
        subtitle="Klik: filter step awal (1-2)"
        icon={<Percent className="w-4 h-4 text-[#1F7A5C] dark:text-emerald-400" />}
        valueColor="text-[#FF5A1F] dark:text-[#FF7A45]"
        isActive={crossFilter?.key === 'gate_strict'}
        onClick={() =>
          toggleCrossFilter({
            source: 'kpi-gate',
            key: 'gate_strict',
            value: 'step_early',
            label: 'Gate: Step Awal (1-2)',
          })
        }
        tooltip="Klik untuk memfilter kandidat yang gugur di formulir awal"
      />
    </div>
  );
};
