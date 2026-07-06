import type { Transaction } from '../../data/models/transactions/types/transactionTypes';

export function calculateMonthlySavingsRate(transactions: Transaction[]): number {
  const monthStr = new Date().toISOString().substring(0, 7);

  const monthlyIncome = transactions
    .filter((t) => t.direction === 'received' && t.spentAt.startsWith(monthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.direction === 'spent' && t.spentAt.startsWith(monthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  if (monthlyIncome <= 0) {
    return 0;
  }

  return Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100);
}
