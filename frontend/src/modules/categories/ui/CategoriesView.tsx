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
import { sumSpentByCategoryIdForMonth } from './categoryBudgetUtils';

export const CategoriesView: React.FC = () => {
  const { categories, transactions, isLoading } = useApp();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [monthValue, setMonthValue] = useState(() => toMonthInputValue(new Date()));

  const spentByCategory = useMemo(
    () => sumSpentByCategoryIdForMonth(transactions, monthValue),
    [transactions, monthValue],
  );

  return (
    <div className="animate-fade-in">
      <div className="categories-toolbar">
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

      {isLoading ? (
        <GlassCard className="p-12 text-center text-body-muted">Loading themes...</GlassCard>
      ) : (
        <div className="flex-grid">
          {categories.map((category) => (
            <CategoryBudgetCard
              key={category.id}
              category={category}
              spent={spentByCategory[category.id] ?? 0}
              onEdit={() => setEditingCategory(category)}
            />
          ))}

          <button
            type="button"
            className="category-new-tile"
            onClick={() => setShowAddCategory(true)}
          >
            <span className="category-new-tile-icon">
              <Plus size={22} />
            </span>
            <span className="category-new-tile-title">New Category</span>
            <span className="category-new-tile-desc">Expand your budget tracking</span>
          </button>
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
