import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search, ArrowUpDown, Download, Trash2, Calendar, Tag, Wallet, Loader2, Upload, Plus, Repeat, Pencil, Pause, Play } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { ActionMenu } from '../../../common/components/ActionMenu';
import { SelectField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { transactionsApi } from '../../../data/api/transactionsApi';
import { unwrapApiResult } from '../../../modules/auth/types/authTypes';
import type { Transaction, TransactionSortField } from '../../../data/models/transactions/types/transactionTypes';
import { TRANSACTIONS_PAGE_SIZE } from '../../../data/models/transactions/types/transactionTypes';
import type { RecurringPayment } from '../../../data/models/recurring/types/recurringTypes';
import { strings } from '../../../common/texts/strings';
import { ImportTransactionsModal } from './ImportTransactionsModal';
import { AddRecurringPaymentModal } from './AddRecurringPaymentModal';
import { EditRecurringPaymentModal } from './EditRecurringPaymentModal';
import { EditTransactionModal } from './EditTransactionModal';
import { RECURRING_FREQUENCY_LABELS } from '../../../data/models/recurring/types/recurringTypes';

export const TransactionsView: React.FC = () => {
  const { accounts, deleteTransaction, updateRecurringPayment, transactionsRevision, recurringPayments } = useApp();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddRecurringModal, setShowAddRecurringModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringPayment | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [togglingRecurringId, setTogglingRecurringId] = useState<string | null>(null);
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

  const handleToggleRecurring = async (payment: RecurringPayment) => {
    const nextActive = !payment.isActive;
    const actionLabel = nextActive ? 'resume' : 'pause';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this recurring payment?`)) return;

    setTogglingRecurringId(payment.id);
    try {
      await updateRecurringPayment(payment.id, { isActive: nextActive });
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${actionLabel} recurring payment`);
    } finally {
      setTogglingRecurringId(null);
    }
  };

  const showEmptyState = !isLoading && transactions.length === 0 && !error;
  const showEndOfList = !isLoading && !hasMore && transactions.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-end items-center mb-8">
        <div className="flex gap-2">
          <button
            type="button"
            className="clay-btn flex items-center gap-2"
            onClick={() => setShowAddRecurringModal(true)}
          >
            <Plus size={20} />
            <span>{strings.addRecurringPayment}</span>
          </button>
          <button
            type="button"
            className="glass-btn glass-btn-sm flex items-center gap-2"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={20} className="text-accent" />
            <span>Import Excel</span>
          </button>
          <button type="button" className="glass-btn glass-btn-sm flex items-center gap-2">
            <Download size={20} className="text-accent" />
            <span>Export CSV</span>
          </button>
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
            <button type="button" className="glass-btn glass-btn-sm flex-1 flex items-center justify-center gap-2" onClick={() => toggleSort('spentAt')}>
              <Calendar size={18} className="text-accent" />
              <span className="text-xs font-bold uppercase">Date</span>
              <ArrowUpDown size={14} className="text-slate-400" />
            </button>
            <button type="button" className="glass-btn glass-btn-sm flex-1 flex items-center justify-center gap-2" onClick={() => toggleSort('amount')}>
              <span className="text-xs font-bold uppercase">Amount</span>
              <ArrowUpDown size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </GlassCard>

      {recurringPayments.length > 0 && (
        <GlassCard className="mb-8 p-0">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Repeat size={18} className="text-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0">
              {strings.recurringTransactions}
            </h3>
          </div>
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{strings.nextRun}</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Notes</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Account</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{strings.frequency}</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="p-4 w-12" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recurringPayments.map((payment) => (
                    <tr key={payment.id} className={`transaction-row ${payment.isActive ? '' : 'opacity-60'}`}>
                      <td className="p-4 text-sm text-slate-600">{new Date(payment.nextRunAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-800 m-0">{payment.notes || 'No notes'}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-soft text-xs font-medium">
                          <Tag size={12} /> {payment.categoryLabel}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                          <Wallet size={14} /> {payment.accountName}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{RECURRING_FREQUENCY_LABELS[payment.frequency]}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${payment.isActive ? 'bg-accent-soft' : 'bg-slate-100 text-slate-500'}`}>
                          {payment.isActive ? strings.active : strings.paused}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold ${payment.direction === 'received' ? 'text-increase' : 'text-decrease'}`}>
                        {payment.direction === 'received' ? '+' : '-'}₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <ActionMenu
                          ariaLabel={`Options for ${payment.notes || 'recurring payment'}`}
                          items={[
                            {
                              id: 'edit',
                              label: strings.editRecurringPayment,
                              icon: Pencil,
                              onClick: () => setEditingRecurring(payment),
                            },
                            {
                              id: 'toggle',
                              label: payment.isActive
                                ? strings.pauseRecurringPayment
                                : strings.resumeRecurringPayment,
                              icon: payment.isActive ? Pause : Play,
                              disabled: togglingRecurringId === payment.id,
                              onClick: () => void handleToggleRecurring(payment),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-0">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Notes</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Account</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="p-4 w-12" aria-label="Actions" />
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
                      <tr key={t.id} className="transaction-row">
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
                          <ActionMenu
                            ariaLabel={`Options for ${t.notes || 'transaction'}`}
                            items={[
                              {
                                id: 'edit',
                                label: strings.editTransaction,
                                icon: Pencil,
                                onClick: () => setEditingTransaction(t),
                              },
                              {
                                id: 'delete',
                                label: strings.delete,
                                icon: Trash2,
                                danger: true,
                                onClick: () => void handleDelete(t.id),
                              },
                            ]}
                          />
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

      {showAddRecurringModal && (
        <AddRecurringPaymentModal onClose={() => setShowAddRecurringModal(false)} />
      )}

      {editingRecurring && (
        <EditRecurringPaymentModal
          payment={editingRecurring}
          onClose={() => setEditingRecurring(null)}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdated={(updated) => {
            setTransactions((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item)),
            );
          }}
        />
      )}
    </div>
  );
};
