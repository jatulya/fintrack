import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { ClayButton } from '../../../common/components/ClayButton';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex-center p-4">
      <GlassCard className="w-full max-w-lg p-0 overflow-hidden animate-fade-in" dark>
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">Add Category</h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <p className="text-rose-400 text-sm m-0">{error}</p>
          )}

          <InputField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Essentials"
            className="bg-white/5 text-white border-white/10"
            required
          />

          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Food & Dining"
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

          <div className="flex gap-4 pt-4">
            <ClayButton type="button" variant="secondary" onClick={onClose} className="flex-1 bg-white/10 text-white">
              {strings.cancel}
            </ClayButton>
            <ClayButton type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : strings.save}
            </ClayButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
