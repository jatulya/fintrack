import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { strings } from '../../../common/texts/strings';
import { maxMonthInputValue, toMonthInputValue } from '../../analytics/ui/periodUtils';
import { useApp } from '../../../data/api/AppContext';
import type { Category } from '../../../data/models/categories/types/categoryTypes';
import { AddCategoryModal } from './AddCategoryModal';
import { CategoryBudgetCard } from './CategoryBudgetCard';
import { EditCategoryModal } from './EditCategoryModal';
import { CategoryLimitBanner } from './CategoryLimitBanner';
import {
  matchesSpendPercentFilter,
  sumSpentByCategoryIdForMonth,
  topBudgetSignals,
  type SpendPercentFilter,
} from './categoryBudgetUtils';

export const CategoriesView: React.FC = () => {
  const { categories, transactions, isLoading } = useApp();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [monthValue, setMonthValue] = useState(() => toMonthInputValue(new Date()));
  const [spendFilter, setSpendFilter] = useState<SpendPercentFilter>('all');

  const spentByCategory = useMemo(
    () => sumSpentByCategoryIdForMonth(transactions, monthValue),
    [transactions, monthValue],
  );

  const budgetSignals = useMemo(
    () => topBudgetSignals(categories, spentByCategory),
    [categories, spentByCategory],
  );

  const visibleCategories = useMemo(
    () =>
      categories.filter((category) =>
        matchesSpendPercentFilter(
          spentByCategory[category.id] ?? 0,
          category.monthlyBudget,
          spendFilter,
        ),
      ),
    [categories, spentByCategory, spendFilter],
  );

  return (
    <div className="animate-fade-in">
      <div className="categories-toolbar">
        <button type="button" className="clay-btn" onClick={() => setShowAddCategory(true)}>
          <Plus size={20} />
          {strings.addCategory}
        </button>

        <div className="categories-toolbar-filters">
          <label className="categories-month-field">
            <span className="categories-month-label">{strings.categoriesSpendFilterLabel}</span>
            <select
              className="categories-month-input"
              value={spendFilter}
              onChange={(e) => setSpendFilter(e.target.value as SpendPercentFilter)}
              aria-label={strings.categoriesSpendFilterLabel}
            >
              <option value="all">{strings.categoriesSpendFilterAll}</option>
              <option value="25">{strings.categoriesSpendFilter25}</option>
              <option value="50">{strings.categoriesSpendFilter50}</option>
              <option value="75">{strings.categoriesSpendFilter75}</option>
              <option value="100">{strings.categoriesSpendFilter100}</option>
            </select>
          </label>

          <label className="categories-month-field">
            <span className="categories-month-label">{strings.periodMonth}</span>
            <input
              type="month"
              className="categories-month-input"
              value={monthValue}
              max={maxMonthInputValue()}
              onChange={(e) => setMonthValue(e.target.value)}
              aria-label={strings.periodMonth}
            />
          </label>
        </div>
      </div>

      {!isLoading && <CategoryLimitBanner items={budgetSignals} />}

      {isLoading ? (
        <GlassCard className="p-12 text-center text-body-muted">Loading themes...</GlassCard>
      ) : categories.length === 0 ? (
        <GlassCard className="p-12 text-center text-body-muted">{strings.categoriesEmpty}</GlassCard>
      ) : visibleCategories.length === 0 ? (
        <GlassCard className="p-12 text-center text-body-muted">
          {strings.categoriesSpendFilterEmpty}
        </GlassCard>
      ) : (
        <div className="flex-grid">
          {visibleCategories.map((category) => (
            <CategoryBudgetCard
              key={category.id}
              category={category}
              spent={spentByCategory[category.id] ?? 0}
              onEdit={() => setEditingCategory(category)}
            />
          ))}
        </div>
      )}

      {showAddCategory && <AddCategoryModal onClose={() => setShowAddCategory(false)} />}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};
