import React, { useState } from 'react';
import { CustomModal } from '../../../common/components/CustomModal';
import { InputField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { strings } from '../../../common/texts/strings';

interface AddCategoryModalProps {
  onClose: () => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose }) => {
  const { createCategory } = useApp();
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!label || !name) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createCategory({ label, name, color });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      title="Add Category"
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
