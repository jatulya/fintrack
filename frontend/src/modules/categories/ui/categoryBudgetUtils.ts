import type { Transaction } from '../../../data/models/transactions/types/transactionTypes';
import { toMonthInputValue } from '../../analytics/ui/periodUtils';

function parseSpentAt(spentAt: string): Date {
  return new Date(spentAt.includes('T') ? spentAt : `${spentAt}T00:00:00`);
}

/** Sum of spent amounts in a calendar month (YYYY-MM), keyed by category id. */
export function sumSpentByCategoryIdForMonth(
  transactions: Transaction[],
  monthKey: string,
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const t of transactions) {
    if (t.direction !== 'spent') continue;
    const key = toMonthInputValue(parseSpentAt(t.spentAt));
    if (key !== monthKey) continue;
    totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
  }

  return totals;
}

/** Sum of spent amounts this calendar month, keyed by category id. */
export function sumSpentByCategoryIdThisMonth(
  transactions: Transaction[],
  now = new Date(),
): Record<string, number> {
  return sumSpentByCategoryIdForMonth(transactions, toMonthInputValue(now));
}

export function budgetPercentSpent(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

export type BudgetSignalStatus = 'over' | 'reached' | 'warning';

export interface BudgetSignal {
  id: string;
  label: string;
  spent: number;
  budget: number;
  percent: number;
  overBy: number;
  status: BudgetSignalStatus;
}

const WARNING_PERCENT = 75;

export type SpendPercentFilter = 'all' | '25' | '50' | '75' | '100';

function spendPercent(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return (spent / budget) * 100;
}

function signalForSpend(spent: number, budget: number): BudgetSignalStatus | null {
  if (budget <= 0 || spent <= 0) return null;
  const percent = spendPercent(spent, budget);
  if (spent > budget) return 'over';
  if (Math.round(percent) >= 100) return 'reached';
  if (percent >= WARNING_PERCENT) return 'warning';
  return null;
}

/** Highest-spend themes that are over budget, at 100%, or at 75% and above. */
export function topBudgetSignals(
  categories: Array<{ id: string; label: string; monthlyBudget: number | null }>,
  spentByCategory: Record<string, number>,
  limit = 3,
): BudgetSignal[] {
  return categories
    .flatMap((category) => {
      const budget = category.monthlyBudget;
      const spent = spentByCategory[category.id] ?? 0;
      if (budget == null || budget <= 0) return [];
      const status = signalForSpend(spent, budget);
      if (!status) return [];
      return [
        {
          id: category.id,
          label: category.label,
          spent,
          budget,
          percent: Math.round(spendPercent(spent, budget)),
          overBy: Math.max(0, spent - budget),
          status,
        },
      ];
    })
    .sort((a, b) => b.percent - a.percent || b.overBy - a.overBy)
    .slice(0, limit);
}

export function matchesSpendPercentFilter(
  spent: number,
  budget: number | null,
  filter: SpendPercentFilter,
): boolean {
  if (filter === 'all') return true;
  if (budget == null || budget <= 0) return false;
  return spendPercent(spent, budget) >= Number(filter);
}
