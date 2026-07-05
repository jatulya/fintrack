import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search, ArrowUpDown, Download, Trash2, Calendar, Tag, Wallet, Loader2, Upload } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { SelectField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { transactionsApi } from '../../../data/api/transactionsApi';
import { unwrapApiResult } from '../../../modules/auth/types/authTypes';
import type { Transaction, TransactionSortField } from '../../../data/models/transactions/types/transactionTypes';
import { TRANSACTIONS_PAGE_SIZE } from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';
import { ImportTransactionsModal } from './ImportTransactionsModal';

export const TransactionsView: React.FC = () => {
  const { accounts, deleteTransaction, transactionsRevision } = useApp();
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('All');
  const [accountFilter, setAccountFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<TransactionSortField>('spentAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLTableRowElement>(null);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const listParams = useMemo(() => ({
    limit: TRANSACTIONS_PAGE_SIZE,
    direction: directionFilter === 'All' ? undefined : directionFilter as 'received' | 'spent',
    accountId: accountFilter === 'All' ? undefined : accountFilter,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
  }), [directionFilter, accountFilter, debouncedSearch, sortBy, sortOrder]);

  const fetchPage = useCallback(async (reset: boolean) => {
    if (isFetchingRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setError(null);

    if (reset) {
      setIsLoading(true);
      offsetRef.current = 0;
      hasMoreRef.current = true;
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await transactionsApi.list({
        ...listParams,
        offset: reset ? 0 : offsetRef.current,
      });
      const { transactions: page, hasMore: pageHasMore } = unwrapApiResult(result);

      setTransactions((prev) => (reset ? page : [...prev, ...page]));
      hasMoreRef.current = pageHasMore;
      setHasMore(pageHasMore);
      offsetRef.current = reset ? page.length : offsetRef.current + page.length;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      if (reset) {
        setTransactions([]);
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [listParams]);

  useEffect(() => {
    void fetchPage(true);
  }, [fetchPage, transactionsRevision]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && !isLoadingMore && hasMore) {
          void fetchPage(false);
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, isLoading, isLoadingMore]);

  const toggleSort = (field: TransactionSortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const showEmptyState = !isLoading && transactions.length === 0 && !error;
  const showEndOfList = !isLoading && !hasMore && transactions.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-end items-center mb-8">
        <div className="flex gap-2">
          <GlassCard
            className="p-2 px-4 flex items-center gap-2 cursor-pointer hover-scale"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={20} className="text-accent" />
            <span className="text-sm font-medium">Import Excel</span>
          </GlassCard>
          <GlassCard className="p-2 px-4 flex items-center gap-2 cursor-pointer hover-scale" onClick={() => { }}>
            <Download size={20} className="text-accent" />
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
                className="w-full clay p-3 pl-10 outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>

          <SelectField
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'received', label: 'Received' },
              { value: 'spent', label: 'Spent' },
            ]}
          />

          <SelectField
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            options={[
              { value: 'All', label: `All ${strings.navStashes}` },
              ...accounts.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />

          <div className="flex gap-2">
            <GlassCard className="flex-1 flex-center p-0 cursor-pointer hover:bg-secondary/50" onClick={() => toggleSort('spentAt')}>
              <Calendar size={18} className="mr-2 text-accent" />
              <span className="text-xs font-bold uppercase">Date</span>
              <ArrowUpDown size={14} className="ml-1 text-slate-400" />
            </GlassCard>
            <GlassCard className="flex-1 flex-center p-0 cursor-pointer hover:bg-secondary/50" onClick={() => toggleSort('amount')}>
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
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Notes</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Account</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={24} className="animate-spin text-accent" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {transactions.map((t) => {
                    const account = accounts.find((a) => a.id === t.accountId);
                    return (
                      <tr key={t.id} className="hover:bg-secondary/50/30 transition-colors">
                        <td className="p-4 text-sm text-slate-600">{new Date(t.spentAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <p className="text-sm font-semibold text-slate-800 m-0">{t.notes || 'No notes'}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-soft text-xs font-medium">
                            <Tag size={12} /> {t.categoryLabel}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                            <Wallet size={14} /> {account?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className={`p-4 text-right font-bold ${t.direction === 'received' ? 'text-increase' : 'text-decrease'}`}>
                          {t.direction === 'received' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-decrease transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {error && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <p className="text-decrease mb-3 m-0">{error}</p>
                        <button
                          type="button"
                          onClick={() => void fetchPage(transactions.length === 0)}
                          className="text-sm font-medium text-accent hover:opacity-80 bg-transparent border-none cursor-pointer"
                        >
                          Try again
                        </button>
                      </td>
                    </tr>
                  )}

                  {showEmptyState && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}

                  {isLoadingMore && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin text-accent" />
                          <span>Loading more transactions...</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {showEndOfList && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 text-sm">
                        You&apos;ve reached the end of the list.
                      </td>
                    </tr>
                  )}

                  {hasMore && !isLoading && !isLoadingMore && (
                    <tr ref={loadMoreRef} aria-hidden="true">
                      <td colSpan={6} className="p-2" />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {showImportModal && (
        <ImportTransactionsModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => void fetchPage(true)}
        />
      )}
    </div>
  );
};
