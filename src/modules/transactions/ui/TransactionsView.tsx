import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Download, Edit2, Trash2, Calendar, Tag, Wallet } from 'lucide-react';
import { GlassCard } from '../../../common/widgets/GlassCard';
import { SelectField } from '../../../common/widgets/InputField';
import { useApp } from '../../../data/api/AppContext';
import { TransactionType } from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';

export const TransactionsView: React.FC = () => {
  const { transactions, accounts, setTransactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [accountFilter, setAccountFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || t.type === typeFilter;
        const matchesAccount = accountFilter === 'All' || t.accountId === accountFilter;
        return matchesSearch && matchesType && matchesAccount;
      })
      .sort((a, b) => {
        const valA = a[sortBy as keyof typeof a];
        const valB = b[sortBy as keyof typeof b];
        if (valA! < valB!) return sortOrder === 'asc' ? -1 : 1;
        if (valA! > valB!) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, accountFilter, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Transaction Logs</h1>
        <div className="flex gap-2">
          <GlassCard className="p-2 px-4 flex items-center gap-2 cursor-pointer hover-scale" onClick={() => {}}>
            <Download size={20} className="text-indigo-600" />
            <span className="text-sm font-medium">Export CSV</span>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={strings.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full clay p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
            </div>
          </div>
          
          <SelectField 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Types' },
              { value: TransactionType.Income, label: 'Income' },
              { value: TransactionType.Expense, label: 'Expense' },
              { value: TransactionType.Transfer, label: 'Transfer' },
            ]}
          />

          <SelectField 
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Accounts' },
              ...accounts.map(a => ({ value: a.id, label: a.name }))
            ]}
          />

          <div className="flex gap-2">
             <GlassCard className="flex-1 flex-center p-0 cursor-pointer hover:bg-indigo-50" onClick={() => toggleSort('date')}>
                <Calendar size={18} className="mr-2 text-indigo-500" />
                <span className="text-xs font-bold uppercase">Date</span>
                <ArrowUpDown size={14} className="ml-1 text-slate-400" />
             </GlassCard>
             <GlassCard className="flex-1 flex-center p-0 cursor-pointer hover:bg-indigo-50" onClick={() => toggleSort('amount')}>
                <span className="text-xs font-bold uppercase">Amount</span>
                <ArrowUpDown size={14} className="ml-1 text-slate-400" />
             </GlassCard>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Account</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => {
                const account = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800 m-0">{t.description || 'No description'}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">
                        <Tag size={12} /> {t.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                        <Wallet size={14} /> {account?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold ${t.type === TransactionType.Income ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.Income ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
