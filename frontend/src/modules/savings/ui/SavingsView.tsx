import React from 'react';
import { GlassCard } from '../../../common/components/GlassCard';
import { useApp } from '../../../data/api/AppContext';
import { AssetAllocationCard } from './AssetAllocationCard';
import { SavingsGoalsPanel } from './SavingsGoalsPanel';
import { SavingsKpiBar } from './SavingsKpiBar';
import { SavingsTrajectoryChart } from './SavingsTrajectoryChart';
import {
  DEMO_ASSET_ALLOCATION,
  DEMO_PROJECTED_COMPLETION,
  DEMO_TRAJECTORY,
} from './savingsDemoData';

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <SavingsGoalsPanel goals={goals} />

        <div className="min-w-0">
          <AssetAllocationCard items={DEMO_ASSET_ALLOCATION} />
          <SavingsTrajectoryChart
            data={DEMO_TRAJECTORY}
            projectedCompletion={DEMO_PROJECTED_COMPLETION}
          />
        </div>
      </div>
    </div>
  );
};
