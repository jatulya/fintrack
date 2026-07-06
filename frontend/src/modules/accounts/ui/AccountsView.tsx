import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { GlassCard, StashCard } from '../../../common/components';
import { strings } from '../../../common/texts/strings';
import { useApp } from '../../../data/api/AppContext';
import { AddAccountModal } from './AddAccountModal';

export const AccountsView: React.FC = () => {
  const { accounts, isLoading } = useApp();
  const [showAddAccount, setShowAddAccount] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-end items-center mb-8">
        <button onClick={() => setShowAddAccount(true)} className="clay-btn">
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
        <div className="flex-grid">
          {accounts.map((account, index) => (
            <StashCard key={account.id} account={account} index={index} />
          ))}
        </div>
      )}

      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} />}
    </div>
  );
};
