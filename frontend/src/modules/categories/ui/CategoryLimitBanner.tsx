import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import { formatCurrency } from '../../analytics/ui/periodUtils';
import type { BudgetSignal } from './categoryBudgetUtils';

interface CategoryLimitBannerProps {
  items: BudgetSignal[];
}

function statusLabel(item: BudgetSignal): string {
  if (item.status === 'over') {
    return `${formatCurrency(item.overBy)} ${strings.categoriesLimitOverBy}`;
  }
  if (item.status === 'reached') return strings.categoriesLimitReached;
  return `${item.percent}% ${strings.categoriesLimitNearUsed}`;
}

export const CategoryLimitBanner: React.FC<CategoryLimitBannerProps> = ({ items }) => {
  if (items.length === 0) {
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

  const hasOverLimit = items.some((item) => item.status === 'over');

  return (
    <section
      role="status"
      className={`category-limit-banner category-limit-banner-combined${
        hasOverLimit ? ' category-limit-banner-has-alert' : ''
      }`}
    >
      <div className="category-limit-banner-heading">
        <AlertTriangle size={18} aria-hidden="true" />
        <h2 className="category-limit-banner-title">{strings.categoriesLimitStatusTitle}</h2>
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
};
