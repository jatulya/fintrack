import React from 'react';
import { Landmark, Layers, PiggyBank } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import type { AssetAllocationItem } from './savingsDemoData';
import { formatInr } from './savingsMetrics';

interface AssetAllocationCardProps {
  items: AssetAllocationItem[];
}

const ALLOCATION_ICONS: Record<string, LucideIcon> = {
  savings: PiggyBank,
  'liquid-mf': Layers,
  fd: Landmark,
};

export const AssetAllocationCard: React.FC<AssetAllocationCardProps> = ({ items }) => {
  return (
    <div className="savings-panel mb-6">
      <h3 className="font-semibold text-lg m-0 mb-5">{strings.savingsAssetLocation}</h3>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = ALLOCATION_ICONS[item.id] ?? PiggyBank;
          return (
            <div key={item.id} className="savings-allocation-row">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF2F5] flex-center text-accent shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="font-medium text-sm m-0 truncate">{item.name}</p>
                    <p className="font-bold text-sm m-0 shrink-0">{formatInr(item.amount)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/80 rounded-full transition-all"
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-body-muted shrink-0 w-12 text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
