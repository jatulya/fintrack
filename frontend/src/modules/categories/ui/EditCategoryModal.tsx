import React, { useState } from 'react';
import { CustomModal } from '../../../common/components/CustomModal';
import { InputField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import type { Category } from '../../../data/models/categories/types/categoryTypes';
import { strings } from '../../../common/texts/strings';
import { parseMonthlyBudgetInput } from './parseBudgetInput';

interface EditCategoryModalProps {
  category: Category;
  onClose: () => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ category, onClose }) => {
  const { updateCategory } = useApp();
  const [label, setLabel] = useState(category.label);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color ?? '#6366f1');
  const [monthlyBudget, setMonthlyBudget] = useState(
    category.monthlyBudget != null ? String(Math.trunc(category.monthlyBudget)) : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!label || !name) return;

    const parsedBudget = parseMonthlyBudgetInput(monthlyBudget);
    if (parsedBudget === 'invalid') {
      setError('Monthly budget must be a whole number');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await updateCategory(category.id, {
        label,
        name,
        color,
        monthlyBudget: parsedBudget,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      title="Edit Theme"
      onClose={onClose}
      onSubmit={handleSubmit}
      primaryText={isSubmitting ? 'Saving...' : strings.save}
      secondaryText={strings.cancel}
      primaryDisabled={isSubmitting}
    >
      {error && <p className="modal-error text-sm m-0">{error}</p>}

      <InputField
        label="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. dining, salary, entertainment"
        className="bg-white/5 text-white border-white/10"
        required
      />

      <InputField
        label="Description"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Food from outside, Monthly salary"
        className="bg-white/5 text-white border-white/10"
        required
      />

      <InputField
        label="Monthly budget (₹)"
        type="number"
        value={monthlyBudget}
        onChange={(e) => setMonthlyBudget(e.target.value)}
        placeholder="Optional — e.g. 3000"
        className="bg-white/5 text-white border-white/10"
        min={0}
        step={1}
        inputMode="numeric"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300 ml-1">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer p-1"
        />
      </div>
    </CustomModal>
  );
};
