import React, { useEffect, useState } from 'react';
import { useApp } from '../../../data/api/AppContext';
import { dashboardApi } from '../../../data/api/dashboardApi';
import { unwrapApiResult } from '../../auth/types/authTypes';
import type { AssetAllocationItem } from '../../../data/models/dashboard/types/dashboardTypes';
import { GlassCard } from '../../../common/components/GlassCard';
import { AssetAllocationCard } from './AssetAllocationCard';
import { SavingsGoalsPanel } from './SavingsGoalsPanel';
import { SavingsKpiBar } from './SavingsKpiBar';

export const SavingsView: React.FC = () => {
  const { goals, goalMetrics, isLoading, transactionsRevision } = useApp();
  const [allocation, setAllocation] = useState<AssetAllocationItem[]>([]);
  const [allocationLoading, setAllocationLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAllocationLoading(true);

    dashboardApi
      .getSummary()
      .then((result) => {
        if (!cancelled) {
          setAllocation(unwrapApiResult(result).summary.assetAllocation ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllocation([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAllocationLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transactionsRevision]);

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
        <AssetAllocationCard items={allocation} isLoading={allocationLoading} />
      </div>
    </div>
  );
};
