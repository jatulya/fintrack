import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './storage';
import { Account, AccountType } from '../models/accounts/types/accountTypes';
import { Transaction, TransactionType } from '../models/transactions/types/transactionTypes';
import { SavingsGoal, Investment } from '../models/goals/types/goalTypes';
import { BudgetLimit } from '../models/budgets/types/budgetTypes';

interface AppContextType {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[]) => void;
  investments: Investment[];
  setInvestments: (investments: Investment[]) => void;
  budgets: BudgetLimit[];
  setBudgets: (budgets: BudgetLimit[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('finpulse_accounts', [
    {
      id: '1',
      name: 'HDFC Bank',
      type: AccountType.Savings,
      currency: 'INR',
      balance: 45200,
      openingBalance: 40000,
      color: '#6366f1',
      icon: 'landmark',
      lastActivity: '2026-05-10',
      isArchived: false,
      trend30Days: 5.2
    },
    {
      id: '2',
      name: 'Cash Wallet',
      type: AccountType.Cash,
      currency: 'INR',
      balance: 2800,
      openingBalance: 1000,
      color: '#3b82f6',
      icon: 'wallet',
      lastActivity: '2026-05-09',
      isArchived: false,
      trend30Days: -2.1
    }
  ]);

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finpulse_transactions', [
    {
      id: 't1',
      accountId: '1',
      amount: 450,
      type: TransactionType.Expense,
      category: 'Food & Dining',
      date: '2026-05-10',
      description: 'Swiggy - Dinner',
      isRecurring: false
    },
    {
      id: 't2',
      accountId: '1',
      amount: 85000,
      type: TransactionType.Income,
      category: 'Salary',
      date: '2026-05-01',
      description: 'Monthly Salary',
      isRecurring: true
    }
  ]);

  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('finpulse_goals', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('finpulse_investments', []);
  const [budgets, setBudgets] = useLocalStorage<BudgetLimit[]>('finpulse_budgets', []);

  return (
    <AppContext.Provider value={{ 
      accounts, setAccounts, 
      transactions, setTransactions,
      goals, setGoals,
      investments, setInvestments,
      budgets, setBudgets
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
