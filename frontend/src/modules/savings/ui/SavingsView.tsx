import React from 'react';
import { useApp } from '../../../data/api/AppContext';
import { GlassCard } from '../../../common/components/GlassCard';
import { AssetAllocationCard } from './AssetAllocationCard';
import { SavingsGoalsPanel } from './SavingsGoalsPanel';
import { SavingsKpiBar } from './SavingsKpiBar';
import { DEMO_ASSET_ALLOCATION } from './savingsDemoData';

export const SavingsView: React.FC = () => {
  const { goals, goalMetrics, isLoading } = useApp();

  if (isLoading && goals.length === 0) {
    return (
      <div className="animate-fade-in">
        <GlassCard className="p-12 text-center text-body-muted">Loading piggy bank...</GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <SavingsKpiBar metrics={goalMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 md:gap-8 items-start">
        <SavingsGoalsPanel goals={goals} />
        <AssetAllocationCard items={DEMO_ASSET_ALLOCATION} />
      </div>
    </div>
  );
};
