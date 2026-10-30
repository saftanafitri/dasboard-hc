import React from 'react';
import { useFilteredData } from '../hooks/useFilteredData';
import { GateKPISection } from '../components/gate/GateKPISection';
import { GateAnalytics } from '../components/gate/GateAnalytics';
import { GateDrawer } from '../components/gate/GateDrawer';

export const GatePage: React.FC = () => {
  const { filteredGateCandidates, filteredCandidates } = useFilteredData();

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden space-y-1.5">
      {/* Slim KPI Strip */}
      <div className="shrink-0 py-0.5">
        <GateKPISection
          gateCandidates={filteredGateCandidates}
          candidates={filteredCandidates}
        />
      </div>

      {/* Main Content: Analitik & Heatmap (100% Fit-to-Screen) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <GateAnalytics gateCandidates={filteredGateCandidates} />
      </div>

      {/* Detail Drawer */}
      <GateDrawer gateCandidates={filteredGateCandidates} />
    </div>
  );
};
