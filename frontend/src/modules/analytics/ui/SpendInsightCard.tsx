import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ClayCard } from '../../../common/components/ClayCard';
import { paths } from '../../../common/routes/paths';
import { strings } from '../../../common/texts/strings';
import { formatCurrency } from './periodUtils';

interface SpendInsightCardProps {
  periodSpendLabel: string;
  periodSpend: number;
  priorAverageLabel: string;
  priorAverage: number;
  percent: number | null;
  comparisonContext: string;
  overLimitCount: number;
  moneyDiaryUrl: string;
}

export const SpendInsightCard: React.FC<SpendInsightCardProps> = ({
  periodSpendLabel,
  periodSpend,
  priorAverageLabel,
  priorAverage,
  percent,
  comparisonContext,
  overLimitCount,
  moneyDiaryUrl,
}) => {
  let comparisonCopy: React.ReactNode;
  if (percent === null && periodSpend > 0 && priorAverage === 0) {
    comparisonCopy = `You have new spending ${comparisonContext} with no comparable spend in the prior 4 periods.`;
  } else if ((percent === 0 || percent === null) && periodSpend === 0) {
    comparisonCopy = `No spending ${comparisonContext}.`;
  } else if (percent !== null) {
    comparisonCopy = (
      <>
        {strings.spendComparedPrefix}{' '}
        <strong>{percent}%</strong> {comparisonContext}.
      </>
    );
  } else {
    comparisonCopy = `No spending ${comparisonContext}.`;
  }

  const limitsCopy =
    overLimitCount === 0
      ? strings.categoriesOverLimitNone
      : overLimitCount === 1
        ? (
          <>
            <strong>1</strong> {strings.categoriesOverLimitOne}
          </>
        )
        : (
          <>
            <strong>{overLimitCount}</strong> {strings.categoriesOverLimitMany}
          </>
        );

  return (
    <ClayCard className="analytics-chart-card spend-insight-card">
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">{strings.spendInsightTitle}</h3>
      </div>

      <div className="spend-insight-stats">
        <div className="spend-insight-stat">
          <span className="spend-insight-stat-label">{periodSpendLabel}</span>
          <span className="spend-insight-stat-value">{formatCurrency(periodSpend)}</span>
        </div>
        <div className="spend-insight-stat">
          <span className="spend-insight-stat-label">{priorAverageLabel}</span>
          <span className="spend-insight-stat-value">{formatCurrency(priorAverage)}</span>
        </div>
      </div>

      <p className="spend-insight-copy">{comparisonCopy}</p>
      <p className="spend-insight-limits">{limitsCopy}</p>

      <div className="spend-insight-actions">
        <Link to={moneyDiaryUrl} className="spend-insight-cta">
          {strings.viewMoneyDiaryCta}
          <ArrowRight size={16} />
        </Link>
        {overLimitCount > 0 && (
          <Link to={paths.categories} className="spend-insight-cta spend-insight-cta-secondary">
            {strings.viewThemesCta}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </ClayCard>
  );
};
