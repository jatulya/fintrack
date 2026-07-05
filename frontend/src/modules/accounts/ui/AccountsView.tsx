import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { strings } from '../../../common/texts/strings';
import { useApp } from '../../../data/api/AppContext';
import { AddAccountModal } from './AddAccountModal';

export const AccountsView: React.FC = () => {
  const { accounts, isLoading } = useApp();
  const [showAddAccount, setShowAddAccount] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{strings.navStashes}</h1>
        <button onClick={() => setShowAddAccount(true)} className="clay-btn flex items-center gap-2">
          <Plus size={20} /> {strings.addAccount}
        </button>
      </div>

      {isLoading ? (
        <GlassCard className="p-12 text-center text-body-muted">Loading stashes...</GlassCard>
      ) : accounts.length === 0 ? (
        <GlassCard className="p-12 text-center text-body-muted">
          No stashes yet. Add one to start your money diary.
        </GlassCard>
      ) : (
        <div className="grid-auto-fit">
          {accounts.map((account) => (
            <GlassCard key={account.id}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-accent-soft">
                  <Wallet size={24} />
                </div>
              </div>

              <h3 className="text-xl font-bold m-0">{account.name}</h3>
              {account.notes && <p className="text-sm text-body-muted mt-2 mb-6">{account.notes}</p>}

              <div>
                <p className="text-xs text-body-muted uppercase tracking-widest font-bold mb-1">{strings.currentBalance}</p>
                <p className="text-3xl font-bold m-0">₹{account.amount.toLocaleString()}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} />}
    </div>
  );
};
