import React from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import { formatCurrency } from '../../analytics/ui/periodUtils';
import type { BudgetSignal } from './categoryBudgetUtils';

interface CategoryLimitBannerProps {
  reached: BudgetSignal[];
  warnings: BudgetSignal[];
}

function statusLabel(item: BudgetSignal): string {
  if (item.status === 'over') {
    return `${formatCurrency(item.overBy)} ${strings.categoriesLimitOverBy}`;
  }
  if (item.status === 'reached') return strings.categoriesLimitReached;
  return `${item.percent}% ${strings.categoriesLimitNearUsed}`;
}

function SignalCard({
  title,
  icon,
  className,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  className: string;
  items: BudgetSignal[];
}) {
  return (
    <section role="status" className={`category-limit-banner ${className}`}>
      <div className="category-limit-banner-heading">
        {icon}
        <h2 className="category-limit-banner-title">{title}</h2>
      </div>
      <ol className="category-limit-banner-list">
        {items.map((item) => (
          <li key={item.id} className="category-limit-banner-item">
            <span className="category-limit-banner-label capitalize">{item.label}</span>
            <span className={`category-limit-banner-amount category-limit-status-${item.status}`}>
              {statusLabel(item)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export const CategoryLimitBanner: React.FC<CategoryLimitBannerProps> = ({ reached, warnings }) => {
  if (reached.length === 0 && warnings.length === 0) {
    return (
      <section role="status" className="category-limit-banner category-limit-banner-ok">
        <div className="category-limit-banner-heading">
          <CheckCircle2 size={18} aria-hidden="true" />
          <p className="category-limit-banner-title">{strings.categoriesLimitAllClear}</p>
        </div>
        <p className="category-limit-banner-detail">{strings.categoriesLimitAllClearDetail}</p>
      </section>
    );
  }

  return (
    <div className="category-limit-pair">
      {reached.length > 0 && (
        <SignalCard
          title={strings.categoriesLimitReached}
          icon={<AlertTriangle size={18} aria-hidden="true" />}
          className="category-limit-banner-reached"
          items={reached}
        />
      )}
      {warnings.length > 0 && (
        <SignalCard
          title={strings.categoriesLimitWarningTitle}
          icon={<CircleAlert size={18} aria-hidden="true" />}
          className="category-limit-banner-caution"
          items={warnings}
        />
      )}
    </div>
  );
};
