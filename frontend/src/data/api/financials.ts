import type { Transaction } from '../models/transactions/types/transactionTypes';
import type { Account } from '../models/accounts/types/accountTypes';
import { BudgetLimit } from '../models/budgets/types/budgetTypes';

export const calculateFinScore = (
  transactions: Transaction[],
  accounts: Account[],
  budgets: BudgetLimit[],
): number => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().substring(0, 7);

  const monthlyIncome = transactions
    .filter((t) => t.direction === 'received' && t.spentAt.startsWith(lastMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.direction === 'spent' && t.spentAt.startsWith(lastMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpense) / monthlyIncome : 0;
  const savingsScore = Math.min(100, Math.max(0, savingsRate * 200));

  const budgetScore = budgets.length > 0
    ? (budgets.filter((b) => b.spent <= b.limit).length / budgets.length) * 100
    : 80;

  const consistencyScore = transactions.length > 5 ? 90 : 50;

  const totalBalance = accounts.reduce((acc, a) => acc + a.amount, 0);
  const emergencyScore = totalBalance > (monthlyExpense * 3) ? 100 : (totalBalance / (monthlyExpense * 3 || 1)) * 100;

  return Math.round(
    (savingsScore * 0.4) +
    (budgetScore * 0.3) +
    (consistencyScore * 0.2) +
    (emergencyScore * 0.1),
  );
};

export const getCashFlowForecast = (
  _transactions: Transaction[],
  accounts: Account[],
  days: number = 30,
) => {
  const currentBalance = accounts.reduce((acc, a) => acc + a.amount, 0);
  const forecast = [];

  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().substring(0, 10);

    forecast.push({
      date: dateStr,
      balance: currentBalance - (i * 100),
    });
  }

  return forecast;
};
