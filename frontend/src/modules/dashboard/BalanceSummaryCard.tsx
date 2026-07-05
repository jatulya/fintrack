import type { ReactNode } from 'react';
import { Gem, PiggyBank, type LucideIcon } from 'lucide-react';

interface BalanceSummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  footer: ReactNode;
}

export const BalanceSummaryCard = ({ title, amount, icon: Icon, footer }: BalanceSummaryCardProps) => (
  <article className="balance-summary-card">
    <div className="balance-summary-card-pattern" aria-hidden="true" />

    <div className="balance-summary-card-header">
      <div className="balance-summary-card-icon">
        <Icon size={18} />
      </div>
      <div className="balance-summary-card-heading">
        <h3 className="balance-summary-card-title">{title}</h3>
        <span className="balance-summary-card-period">Monthly</span>
      </div>
    </div>

    <p className="balance-summary-card-amount">₹{amount.toLocaleString()}</p>
    <div className="balance-summary-card-footer">{footer}</div>
  </article>
);

export const SavingsSummaryCard = ({ amount }: { amount: number }) => (
  <BalanceSummaryCard
    title="Your Savings"
    amount={amount}
    icon={PiggyBank}
    footer={<span className="balance-summary-card-meta">This month</span>}
  />
);

export const InvestmentSummaryCard = ({ amount, roiPercent }: { amount: number; roiPercent: number }) => (
  <BalanceSummaryCard
    title="Your Investment"
    amount={amount}
    icon={Gem}
    footer={
      <span className="balance-summary-card-meta">
        ROI {roiPercent >= 0 ? '+' : ''}{roiPercent}%
      </span>
    }
  />
);
