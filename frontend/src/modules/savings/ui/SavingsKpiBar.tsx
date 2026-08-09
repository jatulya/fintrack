import React from 'react';
import { PiggyBank, Target, Wallet, type LucideIcon } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import { formatInr, type SavingsPoolMetrics } from './savingsMetrics';

interface SavingsKpiBarProps {
  metrics: SavingsPoolMetrics;
}

function RadialProgress({ percent, size = 56 }: { percent: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#FDF2F5"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500"
      />
    </svg>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="savings-kpi-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FDF2F5] flex-center text-accent">
          <Icon size={20} />
        </div>
        {trailing}
      </div>
      <p className="text-xs font-medium text-body-muted m-0 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold m-0 leading-tight">{value}</p>
      <p className="text-sm text-body-muted m-0 mt-1">{subtext}</p>
    </div>
  );
}

export const SavingsKpiBar: React.FC<SavingsKpiBarProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
      <KpiCard
        icon={PiggyBank}
        label={strings.savingsKpiCollectedLabel}
        value={formatInr(metrics.totalCollected)}
        subtext={strings.savingsKpiCollected}
      />
      <KpiCard
        icon={Wallet}
        label={strings.savingsKpiRemainingLabel}
        value={formatInr(metrics.amountToCollect)}
        subtext={strings.savingsKpiRemaining}
      />
      <KpiCard
        icon={Target}
        label={strings.savingsKpiTargetLabel}
        value={formatInr(metrics.totalTarget)}
        subtext={strings.savingsKpiTargetPool}
      />
      <KpiCard
        icon={PiggyBank}
        label={strings.savingsKpiRateLabel}
        value={`${metrics.overallRate}%`}
        subtext={strings.savingsKpiRate}
        trailing={
          <div className="relative flex-center w-14 h-14">
            <RadialProgress percent={metrics.overallRate} />
            <span className="absolute inset-0 flex-center text-[11px] font-bold text-accent pointer-events-none">
              {metrics.overallRate}%
            </span>
          </div>
        }
      />
    </div>
  );
};
