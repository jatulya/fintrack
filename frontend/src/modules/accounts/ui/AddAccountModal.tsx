import React, { useState } from 'react';
import { CustomModal } from '../../../common/components/CustomModal';
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

  const handleSubmit = async () => {
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
    <CustomModal
      title={strings.addAccount}
      onClose={onClose}
      onSubmit={handleSubmit}
      primaryText={isSubmitting ? 'Saving...' : strings.save}
      secondaryText={strings.cancel}
      primaryDisabled={isSubmitting}
    >
      {error && <p className="modal-error text-sm m-0">{error}</p>}

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
    </CustomModal>
  );
};
