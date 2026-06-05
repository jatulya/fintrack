import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { ClayButton } from '../../../common/components/ClayButton';
import { InputField, SelectField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { AccountType } from '../../../data/models/accounts/types/accountTypes';
import { strings } from '../../../common/texts/strings';

interface AddAccountModalProps {
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose }) => {
  const { accounts, setAccounts } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.Checking);
  const [currency, setCurrency] = useState('INR');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    const newAccount = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      currency,
      balance: parseFloat(balance),
      openingBalance: parseFloat(balance),
      color,
      icon: 'landmark',
      lastActivity: new Date().toISOString().split('T')[0],
      isArchived: false,
      trend30Days: 0,
    };

    setAccounts([...accounts, newAccount]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex-center p-4">
      <GlassCard className="w-full max-w-lg p-0 overflow-hidden animate-fade-in" dark>
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">{strings.addAccount}</h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <InputField
            label="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HDFC Savings"
            className="bg-white/5 text-white border-white/10"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Account Type"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              options={Object.values(AccountType).map(t => ({ value: t, label: t }))}
              className="bg-white/5 text-white border-white/10"
            />

            <InputField
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="INR"
              className="bg-white/5 text-white border-white/10"
            />

            <InputField
              label="Initial Balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="bg-white/5 text-white border-white/10"
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Theme Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer p-1"
              />
            </div>
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
