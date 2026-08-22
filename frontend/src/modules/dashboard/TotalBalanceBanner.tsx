import { useEffect, useState } from 'react';
import { strings } from '../../common/texts/strings';
import { useApp } from '../../data/api/AppContext';
import { dashboardApi } from '../../data/api/dashboardApi';
import { unwrapApiResult } from '../auth/types/authTypes';
import type { DashboardSummary } from '../../data/models/dashboard/types/dashboardTypes';
import { InvestmentSummaryCard, SavingsSummaryCard } from './BalanceSummaryCard';

const EMPTY_SUMMARY: DashboardSummary = {
  savings: { amount: 0, changePercent: 0 },
  investments: { amount: 0, changePercent: 0 },
  savingsRate: 0,
  assetAllocation: [],
};

export const TotalBalanceBanner = () => {
  const { accounts, transactionsRevision } = useApp();
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.amount, 0);
  const isHealthySavings = summary.savingsRate > 20;

  useEffect(() => {
    let cancelled = false;

    dashboardApi
      .getSummary()
      .then((result) => {
        if (!cancelled) {
          setSummary(unwrapApiResult(result).summary);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(EMPTY_SUMMARY);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transactionsRevision]);

  return (
    <section className="total-balance-banner">
      <div className="total-balance-banner-bg" aria-hidden="true" />

      <div className="total-balance-banner-content">
        <div className="total-balance-primary">
          <p className="total-balance-label">{strings.totalBalance}</p>
          <p className="total-balance-amount">₹{totalBalance.toLocaleString()}</p>
          <span
            className={`total-balance-savings-badge ${isHealthySavings ? 'total-balance-savings-badge-positive' : 'total-balance-savings-badge-error'}`}
          >
            {summary.savingsRate}% {strings.savingsRateLabel}
          </span>
        </div>

        <div className="total-balance-summary-cards">
          <SavingsSummaryCard
            amount={summary.savings.amount}
            changePercent={summary.savings.changePercent}
          />
          <InvestmentSummaryCard
            amount={summary.investments.amount}
            changePercent={summary.investments.changePercent}
          />
        </div>
      </div>
    </section>
  );
};
