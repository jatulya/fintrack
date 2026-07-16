import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '../../../data/api/AppContext';
import { transactionsApi } from '../../../data/api/transactionsApi';
import { unwrapApiResult } from '../../../modules/auth/types/authTypes';
import type { Transaction } from '../../../data/models/transactions/types/transactionTypes';
import { TRANSACTIONS_PAGE_SIZE } from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';
import { AggregateExpenseChart } from './AggregateExpenseChart';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { IncomeVsExpenseChart } from './IncomeVsExpenseChart';
import { PeriodSelector } from './PeriodSelector';
import {
  buildCategoryTotals,
  buildExpenseSeries,
  buildIncomeExpenseSeries,
  getBucketGranularity,
  getExpenseTitle,
  resolvePeriodRange,
  toDateInputValue,
  type PeriodPreset,
} from './periodUtils';

export const AnalyticsView: React.FC = () => {
  const { transactionsRevision } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preset, setPreset] = useState<PeriodPreset>('monthly');
  const [customStart, setCustomStart] = useState(() => {
    const now = new Date();
    return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [customEnd, setCustomEnd] = useState(() => toDateInputValue(new Date()));

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all: Transaction[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await transactionsApi.list({
          limit: TRANSACTIONS_PAGE_SIZE,
          offset,
          sortBy: 'spentAt',
          sortOrder: 'asc',
        });
        const page = unwrapApiResult(result);
        all.push(...page.transactions);
        hasMore = page.hasMore;
        offset += page.transactions.length;
        if (page.transactions.length === 0) break;
      }

      setTransactions(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllTransactions();
  }, [loadAllTransactions, transactionsRevision]);

  const range = useMemo(
    () => resolvePeriodRange(preset, customStart, customEnd),
    [preset, customStart, customEnd],
  );
  const granularity = useMemo(() => getBucketGranularity(range), [range]);

  const expenseSeries = useMemo(
    () => buildExpenseSeries(transactions, range, granularity),
    [transactions, range, granularity],
  );
  const incomeExpenseSeries = useMemo(
    () => buildIncomeExpenseSeries(transactions, range, granularity),
    [transactions, range, granularity],
  );
  const categoryData = useMemo(
    () => buildCategoryTotals(transactions, range),
    [transactions, range],
  );

  if (isLoading) {
    return (
      <div className="analytics-loading animate-fade-in">
        <Loader2 className="animate-spin" size={28} />
        <span>{strings.analyticsLoading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-loading animate-fade-in">
        <p className="text-decrease">{error}</p>
      </div>
    );
  }

  return (
    <div className="analytics-view animate-fade-in">
      <PeriodSelector
        preset={preset}
        customStart={customStart}
        customEnd={customEnd}
        onPresetChange={setPreset}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <div className="analytics-stack">
        <AggregateExpenseChart
          title={getExpenseTitle(preset)}
          data={expenseSeries}
          granularity={granularity}
        />

        <div className="analytics-grid">
          <ExpenseCategoryChart data={categoryData} />
          <IncomeVsExpenseChart data={incomeExpenseSeries} />
        </div>
      </div>
    </div>
  );
};
