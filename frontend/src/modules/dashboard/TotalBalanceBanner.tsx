import { strings } from '../../common/texts/strings';
import { useApp } from '../../data/api/AppContext';
import { splitAccountsByBucket } from './accountBuckets';
import { InvestmentSummaryCard, SavingsSummaryCard } from './BalanceSummaryCard';
import { calculateMonthlySavingsRate } from './savingsRate';

export const TotalBalanceBanner = () => {
  const { accounts, transactions } = useApp();

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.amount, 0);
  const { savingsTotal, investmentTotal } = splitAccountsByBucket(accounts);
  const savingsRate = calculateMonthlySavingsRate(transactions);
  const isHealthySavings = savingsRate > 20;

  const investmentRoi = investmentTotal > 0 && totalBalance > 0
    ? Math.round((investmentTotal / totalBalance) * 100) / 10
    : 0;

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
            {savingsRate}% {strings.savingsRateLabel}
          </span>
        </div>

        <div className="total-balance-summary-cards">
          <SavingsSummaryCard amount={savingsTotal} />
          <InvestmentSummaryCard amount={investmentTotal} roiPercent={investmentRoi} />
        </div>
      </div>
    </section>
  );
};
