import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../../data/api/AppContext';
import { transactionsApi } from '../../../data/api/transactionsApi';
import { unwrapApiResult } from '../../../modules/auth/types/authTypes';
import type { Transaction } from '../../../data/models/transactions/types/transactionTypes';
import { TRANSACTIONS_PAGE_SIZE } from '../../../data/models/transactions/types/transactionTypes';
import { strings } from '../../../common/texts/strings';
import {
  buildMoneyDiaryUrl,
  parseCategoryLabelsFromSearch,
} from './analyticsUrlUtils';
import { AggregateExpenseChart } from './AggregateExpenseChart';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { PeriodSelector } from './PeriodSelector';
import { SpendInsightCard } from './SpendInsightCard';
import {
  buildCategoryTotals,
  buildExpenseSeries,
  buildSpendVsPriorPeriod,
  countCategoriesOverBudget,
  createDefaultPeriodSelection,
  filterTransactionsByCategoryLabels,
  formatPeriodDisplayLabel,
  getBucketGranularity,
  getExpenseTitle,
  resolvePeriodRange,
  type PeriodSelection,
} from './periodUtils';

export const AnalyticsView: React.FC = () => {
  const { transactionsRevision, categories } = useApp();
  const location = useLocation();
  const urlFilterApplied = useRef(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<PeriodSelection>(() => createDefaultPeriodSelection());
  const [selectedLabels, setSelectedLabels] = useState<Set<string> | null>(null);

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

  const categoryOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const c of categories) labels.add(c.label);
    for (const t of transactions) {
      if (t.direction === 'spent' && t.categoryLabel) labels.add(t.categoryLabel);
    }
    return Array.from(labels).sort((a, b) => a.localeCompare(b));
  }, [categories, transactions]);

  useEffect(() => {
    const fromUrl = parseCategoryLabelsFromSearch(location.search);
    if (fromUrl) {
      setSelectedLabels(new Set(fromUrl));
      urlFilterApplied.current = true;
      return;
    }

    if (!urlFilterApplied.current) {
      setSelectedLabels(null);
    }
  }, [location.search]);

  useEffect(() => {
    if (urlFilterApplied.current) return;
    if (categoryOptions.length === 0) return;
    setSelectedLabels(null);
  }, [categoryOptions]);

  const activeLabels = useMemo(
    () => selectedLabels ?? new Set(categoryOptions),
    [selectedLabels, categoryOptions],
  );

  useEffect(() => {
    if (location.hash !== '#expense-categorization') return;
    const timer = window.setTimeout(() => {
      document.getElementById('expense-categorization')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.hash, isLoading, activeLabels]);

  const range = useMemo(() => resolvePeriodRange(selection), [selection]);
  const granularity = useMemo(() => getBucketGranularity(range), [range]);
  const displayLabel = useMemo(
    () => formatPeriodDisplayLabel(selection, range),
    [selection, range],
  );

  const filteredTransactions = useMemo(
    () => filterTransactionsByCategoryLabels(transactions, activeLabels),
    [transactions, activeLabels],
  );

  const expenseSeries = useMemo(
    () => buildExpenseSeries(filteredTransactions, range, granularity),
    [filteredTransactions, range, granularity],
  );
  const categoryData = useMemo(
    () => buildCategoryTotals(filteredTransactions, range),
    [filteredTransactions, range],
  );

  const spendInsight = useMemo(
    () => buildSpendVsPriorPeriod(transactions, selection, activeLabels),
    [transactions, selection, activeLabels],
  );

  const overLimitCount = useMemo(
    () =>
      countCategoriesOverBudget(
        categories.map((c) => ({ label: c.label, monthlyBudget: c.monthlyBudget })),
        transactions,
        activeLabels,
        selection,
      ),
    [categories, transactions, activeLabels, selection],
  );

  const moneyDiaryUrl = useMemo(() => {
    const selectedCategories = categories.filter((c) => activeLabels.has(c.label));
    const allSelected =
      categoryOptions.length > 0 && selectedCategories.length === categoryOptions.length;

    return buildMoneyDiaryUrl({
      categoryIds: allSelected ? undefined : selectedCategories.map((c) => c.id),
      categoryLabels: allSelected ? undefined : selectedCategories.map((c) => c.label),
      selection,
      direction: 'spent',
    });
  }, [categories, activeLabels, categoryOptions.length, selection]);

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
        selection={selection}
        displayLabel={displayLabel}
        onSelectionChange={setSelection}
        categoryOptions={categoryOptions}
        selectedLabels={activeLabels}
        setSelectedLabels={setSelectedLabels}
      />

      <div className="analytics-stack">
        <AggregateExpenseChart
          title={getExpenseTitle(selection.preset)}
          data={expenseSeries}
          granularity={granularity}
        />

        <div className="analytics-grid">
          <ExpenseCategoryChart data={categoryData} />
          <SpendInsightCard
            periodSpendLabel={spendInsight.periodSpendLabel}
            periodSpend={spendInsight.periodSpend}
            priorAverageLabel={spendInsight.priorAverageLabel}
            priorAverage={spendInsight.priorAverage}
            percent={spendInsight.percent}
            comparisonContext={spendInsight.comparisonContext}
            overLimitCount={overLimitCount}
            moneyDiaryUrl={moneyDiaryUrl}
          />
        </div>
      </div>
    </div>
  );
};
