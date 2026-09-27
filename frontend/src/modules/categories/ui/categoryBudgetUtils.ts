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
