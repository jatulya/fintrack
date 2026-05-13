import React, { useState } from 'react';
import { X, Plus, Minus, ArrowLeftRight } from 'lucide-react';
import { GlassCard } from '../../../common/widgets/GlassCard';
import { ClayButton } from '../../../common/widgets/ClayButton';
import { InputField, SelectField } from '../../../common/widgets/InputField';
import { useApp } from '../../../data/api/AppContext';
import { TransactionType } from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';

interface AddTransactionModalProps {
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose }) => {
  const { accounts, transactions, setTransactions } = useApp();
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !category) return;

    const newTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      accountId,
      amount: parseFloat(amount),
      type,
      category,
      date,
      description,
      isRecurring: false,
    };

    setTransactions([newTransaction, ...transactions]);
    onClose();
  };

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
          <div className="flex gap-2 p-1 clay bg-white/10 rounded-2xl">
            <button 
              type="button"
              onClick={() => setType(TransactionType.Expense)}
              className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all ${type === TransactionType.Expense ? 'bg-rose-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
            >
              <Minus size={18} /> {strings.expense}
            </button>
            <button 
              type="button"
              onClick={() => setType(TransactionType.Income)}
              className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all ${type === TransactionType.Income ? 'bg-emerald-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
            >
              <Plus size={18} /> {strings.income}
            </button>
            <button 
              type="button"
              onClick={() => setType(TransactionType.Transfer)}
              className={`flex-1 flex-center gap-2 py-3 rounded-xl transition-all ${type === TransactionType.Transfer ? 'bg-blue-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
            >
              <ArrowLeftRight size={18} /> {strings.transfer}
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
                />
              </div>
            </div>

            <SelectField 
              label="Account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              options={accounts.map(a => ({ value: a.id, label: a.name }))}
              className="bg-white/5 text-white border-white/10"
            />

            <InputField 
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Dining"
              className="bg-white/5 text-white border-white/10"
              required
            />

            <InputField 
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/5 text-white border-white/10"
              required
            />

            <InputField 
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="bg-white/5 text-white border-white/10"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <ClayButton type="button" variant="secondary" onClick={onClose} className="flex-1 bg-white/10 text-white">
              {strings.cancel}
            </ClayButton>
            <ClayButton type="submit" variant="primary" className="flex-1">
              {strings.save}
            </ClayButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
