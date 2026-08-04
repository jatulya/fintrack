import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { CustomModal } from '../../../common/components/CustomModal';
import { InputField, SelectField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import type {
  Transaction,
  TransactionDirection,
} from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdated?: (transaction: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  onClose,
  onUpdated,
}) => {
  const { accounts, categories, updateTransaction } = useApp();
  const [direction, setDirection] = useState<TransactionDirection>(transaction.direction);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [notes, setNotes] = useState(transaction.notes);
  const [spentAt, setSpentAt] = useState(transaction.spentAt.slice(0, 10));
  const [affectsBalance, setAffectsBalance] = useState(transaction.affectsBalance);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noAccounts = accounts.length === 0;
  const noCategories = categories.length === 0;

  const handleSubmit = async () => {
    if (!amount || !accountId || !categoryId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateTransaction(transaction.id, {
        accountId,
        categoryId,
        amount: parseFloat(amount),
        spentAt,
        notes,
        direction,
        affectsBalance,
      });
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      title={strings.editTransaction}
      onClose={onClose}
      onSubmit={handleSubmit}
      primaryText={isSubmitting ? 'Saving...' : strings.save}
      secondaryText={strings.cancel}
      primaryDisabled={isSubmitting || noAccounts || noCategories}
    >
      {error && <p className="modal-error text-sm m-0">{error}</p>}

      <div className="flex gap-2 p-1 clay bg-white/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setDirection('spent')}
          className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all border-none cursor-pointer ${direction === 'spent' ? 'bg-error text-white shadow-lg' : 'modal-label hover:bg-white/5'}`}
        >
          <Minus size={18} /> {strings.expense}
        </button>
        <button
          type="button"
          onClick={() => setDirection('received')}
          className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all border-none cursor-pointer ${direction === 'received' ? 'bg-accent text-white shadow-lg' : 'modal-label hover:bg-white/5'}`}
        >
          <Plus size={18} /> {strings.income}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest modal-label mb-2 block">{strings.amount}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-accent">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-3xl font-bold text-white outline-none focus:border-accent transition-all"
              required
            />
          </div>
        </div>

        <SelectField
          label={strings.navStashes}
          labelClassName="modal-label"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          className="bg-white text-slate-800 border-white/10"
        />

        <SelectField
          label={strings.category}
          labelClassName="modal-label"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categories.map((c) => ({ value: c.id, label: c.label }))}
          className="bg-white text-slate-800 border-white/10"
        />

        <InputField
          label={strings.date}
          type="date"
          value={spentAt}
          onChange={(e) => setSpentAt(e.target.value)}
          className="bg-white/5 text-white border-white/10"
          required
        />

        <InputField
          label={strings.description}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What was this for?"
          className="bg-white/5 text-white border-white/10"
        />

        <label className="col-span-2 flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={affectsBalance}
            onChange={(e) => setAffectsBalance(e.target.checked)}
            className="w-5 h-5 rounded accent-accent"
          />
          <span className="text-sm modal-body">Update stash balance for this entry</span>
        </label>
      </div>
    </CustomModal>
  );
};
