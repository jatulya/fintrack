import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { ClayButton } from '../../../common/components/ClayButton';
import { InputField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { strings } from '../../../common/texts/strings';

interface AddAccountModalProps {
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose }) => {
  const { createAccount } = useApp();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createAccount({
        name,
        amount: amount ? parseFloat(amount) : 0,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex-center p-4">
      <GlassCard className="w-full max-w-lg p-0 overflow-hidden animate-fade-in" dark>
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">{strings.addAccount}</h2>
          <button onClick={onClose} className="modal-label hover:text-white transition-colors border-none bg-transparent cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <p className="modal-error text-sm m-0">{error}</p>
          )}

          <InputField
            label="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HDFC Savings"
            className="bg-white/5 text-white border-white/10"
            required
          />

          <InputField
            label="Initial Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-white/5 text-white border-white/10"
          />

          <InputField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this account"
            className="bg-white/5 text-white border-white/10"
          />

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
