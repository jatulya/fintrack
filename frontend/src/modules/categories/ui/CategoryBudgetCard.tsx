import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import type { Category } from '../../../data/models/categories/types/categoryTypes';
import { colors } from '../../../common/themes/colors';
import { strings } from '../../../common/texts/strings';
import { formatCurrency } from '../../analytics/ui/periodUtils';
import { buildAnalyticsCategoryUrl } from '../../analytics/ui/analyticsUrlUtils';
import { budgetPercentSpent } from './categoryBudgetUtils';

interface CategoryBudgetCardProps {
  category: Category;
  spent: number;
  onEdit: () => void;
}

const RING_SIZE = 120;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  category,
  spent,
  onEdit,
}) => {
  const accent = category.color ?? colors.accent;
  const budget = category.monthlyBudget;
  const hasBudget = budget !== null && budget !== undefined && budget > 0;
  const percent = hasBudget ? budgetPercentSpent(spent, budget) : 0;
  const ringProgress = hasBudget ? Math.min(percent, 100) : 0;
  const remaining = hasBudget ? Math.max(0, budget - spent) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - ringProgress / 100);

  return (
    <div className="category-budget-card clay-card">
      <button
        type="button"
        className="category-budget-edit"
        onClick={onEdit}
        aria-label={`Edit ${category.label}`}
      >
        <Pencil size={16} />
      </button>

      {hasBudget ? (
        <Link
          to={buildAnalyticsCategoryUrl(category.label)}
          className="category-budget-ring-link"
          title="View expense categorization"
        >
          <div className="category-budget-ring" style={{ width: RING_SIZE, height: RING_SIZE }}>
            <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="rgba(31, 3, 34, 0.08)"
                strokeWidth={STROKE}
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={accent}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </svg>
            <div className="category-budget-ring-label">
              <span className="category-budget-percent" style={{ color: accent }}>
                {percent}%
              </span>
              <span className="category-budget-spent-label">SPENT</span>
            </div>
          </div>
        </Link>
      ) : (
        <button type="button" className="category-budget-set-cta" onClick={onEdit}>
          <span className="category-budget-set-dot" style={{ backgroundColor: accent }} />
          {strings.setBudget}
        </button>
      )}

      <h3 className="category-budget-title capitalize">{category.label}</h3>
      <p className="category-budget-name">{category.name}</p>

      {hasBudget ? (
        <>
          <p className="category-budget-usage">
            <span style={{ color: accent }}>{formatCurrency(spent)}</span>
            {' '}of {formatCurrency(budget)} used
          </p>
          <div
            className="category-budget-remaining-box"
            style={{
              background: `color-mix(in srgb, ${accent} 12%, white)`,
            }}
          >
            <span className="category-budget-remaining-amount" style={{ color: accent }}>
              {formatCurrency(remaining)}
            </span>
            <span className="category-budget-remaining-label">{strings.remaining.toUpperCase()}</span>
          </div>
        </>
      ) : (
        <p className="category-budget-usage text-body-muted">No monthly budget set</p>
      )}
    </div>
  );
};
