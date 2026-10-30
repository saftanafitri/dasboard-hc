import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, LayoutDashboard } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useFilteredData } from '../hooks/useFilteredData';
import { KandidatKPISection } from '../components/kandidat/KandidatKPISection';
import { KandidatCockpitTab } from '../components/kandidat/KandidatCockpitTab';
import { KandidatAnalyticsTab } from '../components/kandidat/KandidatAnalyticsTab';
import { CandidateDrawer } from '../components/kandidat/CandidateDrawer';
import { CompareModal } from '../components/kandidat/CompareModal';
import type { ViewTab } from '../types';

export const KandidatPage: React.FC = () => {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const { filteredCandidates } = useFilteredData();

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'cockpit', label: 'Ringkasan (1-Layar)', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'analitik', label: 'Analitik & Grafik', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden space-y-1.5">
      {/* Slim KPI Strip */}
      <div className="shrink-0 py-0.5">
        <KandidatKPISection candidates={filteredCandidates} />
      </div>

      {/* Compact View Tabs Bar (Only Ringkasan & Analitik) */}
      <div className="flex items-center justify-between border-b border-[#E3EAE6] dark:border-[#0E4437] pb-1 shrink-0">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-[#1F7A5C] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-heading hover:bg-[#F1F5F2] dark:hover:bg-[#0A382E]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#1F7A5C] rounded-md -z-10"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <span className="text-[10px] text-text-muted hidden sm:inline-block">
          Total: <strong className="text-text-heading dark:text-white">{filteredCandidates.length}</strong> kandidat
        </span>
      </div>

      {/* Main Tab Content - STRICTLY fits in remaining screen height without whole page scroll */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.12 }}
            className="flex-1 min-h-0 flex flex-col h-full overflow-hidden"
          >
            {activeTab === 'cockpit' ? (
              <KandidatCockpitTab candidates={filteredCandidates} />
            ) : (
              <KandidatAnalyticsTab candidates={filteredCandidates} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Candidate Detail Drawer */}
      <CandidateDrawer candidates={filteredCandidates} />

      {/* Compare Candidates Modal */}
      <CompareModal candidates={filteredCandidates} />
    </div>
  );
};
