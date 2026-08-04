import React, { useState } from 'react';
import { CustomModal } from '../../../common/components/CustomModal';
import { InputField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import type { Account } from '../../../data/models/accounts/types/accountTypes';
import { strings } from '../../../common/texts/strings';

interface EditAccountModalProps {
  account: Account;
  onClose: () => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({ account, onClose }) => {
  const { updateAccount } = useApp();
  const [name, setName] = useState(account.name);
  const [amount, setAmount] = useState(String(account.amount));
  const [notes, setNotes] = useState(account.notes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await updateAccount(account.id, {
        name: name.trim(),
        amount: amount ? parseFloat(amount) : 0,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stash');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      title={strings.editAccount}
      onClose={onClose}
      onSubmit={handleSubmit}
      primaryText={isSubmitting ? 'Saving...' : strings.save}
      secondaryText={strings.cancel}
      primaryDisabled={isSubmitting}
    >
      {error && <p className="modal-error text-sm m-0">{error}</p>}

      <InputField
        label={strings.accountName}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. HDFC Savings"
        className="bg-white/5 text-white border-white/10"
        required
      />

      <InputField
        label={strings.currentBalance}
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
        placeholder="Optional notes about this stash"
        className="bg-white/5 text-white border-white/10"
      />
    </CustomModal>
  );
};
