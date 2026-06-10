import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { ClayButton } from '../../../common/components/ClayButton';
import { InputField, SelectField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import type { TransactionDirection } from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';

interface AddTransactionModalProps {
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose }) => {
  const { accounts, categories, createTransaction } = useApp();
  const [direction, setDirection] = useState<TransactionDirection>('spent');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [spentAt, setSpentAt] = useState(new Date().toISOString().split('T')[0]);
  const [affectsBalance, setAffectsBalance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !categoryId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createTransaction({
        accountId,
        categoryId,
        amount: parseFloat(amount),
        spentAt,
        notes,
        direction,
        affectsBalance,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const noAccounts = accounts.length === 0;
  const noCategories = categories.length === 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex-center p-4">
      <GlassCard className="w-full max-w-lg p-0 overflow-hidden animate-fade-in" dark>
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">{strings.addTransaction}</h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <p className="text-rose-400 text-sm m-0">{error}</p>
          )}

          {(noAccounts || noCategories) && (
            <p className="text-amber-300 text-sm m-0">
              {noAccounts && noCategories
                ? 'Create an account and a category first.'
                : noAccounts
                  ? 'Create an account first.'
                  : 'Create a category first.'}
            </p>
          )}

          <div className="flex gap-2 p-1 clay bg-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setDirection('spent')}
              className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all ${direction === 'spent' ? 'bg-rose-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
            >
              <Minus size={18} /> {strings.expense}
            </button>
            <button
              type="button"
              onClick={() => setDirection('received')}
              className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all ${direction === 'received' ? 'bg-emerald-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
            >
              <Plus size={18} /> {strings.income}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-300">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-3xl font-bold text-white outline-none focus:border-indigo-400 transition-all"
                  required
                  disabled={noAccounts || noCategories}
                />
              </div>
            </div>

            <SelectField
              label="Account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              className="bg-white/5 text-white border-white/10"
            />

            <SelectField
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              className="bg-white/5 text-white border-white/10"
            />

            <InputField
              label="Date"
              type="date"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
              className="bg-white/5 text-white border-white/10"
              required
            />

            <InputField
              label="Notes"
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
                className="w-5 h-5 rounded accent-indigo-500"
              />
              <span className="text-sm text-indigo-100">
                Update account balance for this transaction
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <ClayButton type="button" variant="secondary" onClick={onClose} className="flex-1 bg-white/10 text-white">
              {strings.cancel}
            </ClayButton>
            <ClayButton
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting || noAccounts || noCategories}
            >
              {isSubmitting ? 'Saving...' : strings.save}
            </ClayButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
