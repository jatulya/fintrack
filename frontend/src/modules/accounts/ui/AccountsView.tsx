import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { useApp } from '../../../data/api/AppContext';
import { AddAccountModal } from './AddAccountModal';

export const AccountsView: React.FC = () => {
  const { accounts, isLoading } = useApp();
  const [showAddAccount, setShowAddAccount] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Vault</h1>
        <button
          onClick={() => setShowAddAccount(true)}
          className="clay-btn flex items-center gap-2"
        >
          <Plus size={20} /> Add Account
        </button>
      </div>

      {isLoading ? (
        <GlassCard className="p-12 text-center text-slate-400">Loading accounts...</GlassCard>
      ) : accounts.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-400">
          No accounts yet. Add one to start tracking transactions.
        </GlassCard>
      ) : (
        <div className="grid-auto-fit">
          {accounts.map((account) => (
            <GlassCard key={account.id}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Wallet size={24} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 m-0">{account.name}</h3>
              {account.notes && (
                <p className="text-sm text-slate-500 mt-2 mb-6">{account.notes}</p>
              )}

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Balance</p>
                <p className="text-3xl font-bold text-slate-800 m-0">₹{account.amount.toLocaleString()}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} />}
    </div>
  );
};
