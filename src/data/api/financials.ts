import { Transaction, TransactionType } from '../models/transactions/types/transactionTypes';
import { Account } from '../models/accounts/types/accountTypes';
import { BudgetLimit } from '../models/budgets/types/budgetTypes';

export const calculateFinScore = (
  transactions: Transaction[], 
  accounts: Account[], 
  budgets: BudgetLimit[]
): number => {
  // Simple heuristic for FinScore
  // 1. Savings Rate (40%)
  // 2. Budget Adherence (30%)
  // 3. Consistency (20%)
  // 4. Emergency Fund (10%)

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().substring(0, 7);

  const monthlyIncome = transactions
    .filter(t => t.type === TransactionType.Income && t.date.startsWith(lastMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => t.type === TransactionType.Expense && t.date.startsWith(lastMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpense) / monthlyIncome : 0;
  const savingsScore = Math.min(100, Math.max(0, savingsRate * 200)); // 50% rate = 100 score

  const budgetScore = budgets.length > 0 
    ? (budgets.filter(b => b.spent <= b.limit).length / budgets.length) * 100 
    : 80; // Default if no budgets

  const consistencyScore = transactions.length > 5 ? 90 : 50;
  
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const emergencyScore = totalBalance > (monthlyExpense * 3) ? 100 : (totalBalance / (monthlyExpense * 3 || 1)) * 100;

  return Math.round(
    (savingsScore * 0.4) + 
    (budgetScore * 0.3) + 
    (consistencyScore * 0.2) + 
    (emergencyScore * 0.1)
  );
};

export const getCashFlowForecast = (
  _transactions: Transaction[],
  accounts: Account[],
  days: number = 30
) => {
  let currentBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const forecast = [];

  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().substring(0, 10);

    // This is a simplified forecast. In a real app, you'd check recurring dates.
    // For now, let's just project based on average daily burn.
    forecast.push({
      date: dateStr,
      balance: currentBalance - (i * 100) // Mock burn
    });
  }

  return forecast;
};
