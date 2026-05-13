import React, { useState } from 'react';
import { Plus, Wallet, Landmark, CreditCard, Banknote, Archive, Edit2 } from 'lucide-react';
import { GlassCard } from '../../../common/widgets/GlassCard';
import { useApp } from '../../../data/api/AppContext';
import { AccountType } from '../../../data/models/accounts/types/accountTypes';
import { AddAccountModal } from './AddAccountModal';

export const AccountsView: React.FC = () => {
  const { accounts, setAccounts } = useApp();
  const [showAddAccount, setShowAddAccount] = useState(false);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.Checking: return <Landmark size={24} />;
      case AccountType.Savings: return <CreditCard size={24} />;
      case AccountType.Cash: return <Banknote size={24} />;
      case AccountType.Investment: return <TrendingUp size={24} />;
      case AccountType.Wallet: return <Wallet size={24} />;
      default: return <Wallet size={24} />;
    }
  };

  const handleArchive = (id: string) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, isArchived: !a.isArchived } : a));
  };

  const activeAccounts = accounts.filter(a => !a.isArchived);
  const archivedAccounts = accounts.filter(a => a.isArchived);

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

      <div className="grid-auto-fit mb-12">
        {activeAccounts.map(account => (
          <GlassCard key={account.id} className="relative group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: account.color + '20', color: account.color }}>
                {getAccountIcon(account.type)}
              </div>
              <div className="flex gap-1">
                 <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit2 size={16} /></button>
                 <button onClick={() => handleArchive(account.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Archive size={16} /></button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 m-0">{account.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{account.type}</p>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Balance</p>
                <p className="text-3xl font-bold text-slate-800">₹{account.balance.toLocaleString()}</p>
              </div>
              <div className={`text-sm font-bold flex items-center gap-1 ${account.trend30Days >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {account.trend30Days >= 0 ? '+' : ''}{account.trend30Days}%
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {archivedAccounts.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-slate-400 mb-6">Archived Accounts</h2>
          <div className="grid-auto-fit opacity-60 grayscale">
            {archivedAccounts.map(account => (
              <GlassCard key={account.id} className="bg-slate-100/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-200 text-slate-500">
                      <Archive size={20} />
                    </div>
                    <div>
                      <p className="font-bold m-0">{account.name}</p>
                      <p className="text-xs text-slate-400 m-0">{account.type}</p>
                    </div>
                  </div>
                  <button onClick={() => handleArchive(account.id)} className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Unarchive</button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} />}
    </div>
  );
};

// Simplified TrendingUp for use here if not imported
const TrendingUp = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
