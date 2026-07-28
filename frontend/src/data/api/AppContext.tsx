import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocalStorage } from './storage';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { unwrapApiResult } from '../../modules/auth/types/authTypes';
import { accountsApi } from './accountsApi';
import { categoriesApi } from './categoriesApi';
import { transactionsApi } from './transactionsApi';
import { recurringPaymentsApi } from './recurringPaymentsApi';
import type { Account, CreateAccountInput } from '../models/accounts/types/accountTypes';
import type { Category, CreateCategoryInput } from '../models/categories/types/categoryTypes';
import type { CreateTransactionInput, Transaction } from '../models/transactions/types/transactionTypes';
import type { CreateRecurringPaymentInput, RecurringPayment } from '../models/recurring/types/recurringTypes';
import { TRANSACTIONS_PAGE_SIZE } from '../models/transactions/types/transactionTypes';
import { SavingsGoal, Investment } from '../models/goals/types/goalTypes';
import { BudgetLimit } from '../models/budgets/types/budgetTypes';

interface AppContextType {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  transactionsRevision: number;
  recurringPayments: RecurringPayment[];
  isLoading: boolean;
  error: string | null;
  refreshFinancials: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<Category>;
  createAccount: (input: CreateAccountInput) => Promise<Account>;
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  createRecurringPayment: (input: CreateRecurringPaymentInput) => Promise<RecurringPayment>;
  deleteTransaction: (id: string) => Promise<void>;
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[]) => void;
  investments: Investment[];
  setInvestments: (investments: Investment[]) => void;
  budgets: BudgetLimit[];
  setBudgets: (budgets: BudgetLimit[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsRevision, setTransactionsRevision] = useState(0);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('finpulse_goals', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('finpulse_investments', []);
  const [budgets, setBudgets] = useLocalStorage<BudgetLimit[]>('finpulse_budgets', []);

  const refreshFinancials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesResult, accountsResult, transactionsResult, recurringResult] = await Promise.all([
        categoriesApi.list(),
        accountsApi.list(),
        transactionsApi.list({ limit: TRANSACTIONS_PAGE_SIZE, offset: 0 }),
        recurringPaymentsApi.list(),
      ]);

      setCategories(unwrapApiResult(categoriesResult).categories);
      setAccounts(unwrapApiResult(accountsResult).accounts);
      setTransactions(unwrapApiResult(transactionsResult).transactions);
      setTransactionsRevision((prev) => prev + 1);
      setRecurringPayments(unwrapApiResult(recurringResult).recurringPayments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      refreshFinancials();
    } else {
      setCategories([]);
      setAccounts([]);
      setTransactions([]);
      setTransactionsRevision(0);
      setRecurringPayments([]);
      setError(null);
    }
  }, [isAuthenticated, authLoading, refreshFinancials]);

  const createCategory = useCallback(async (input: CreateCategoryInput): Promise<Category> => {
    const result = await categoriesApi.create(input);
    const category = unwrapApiResult(result).category;
    setCategories((prev) => [...prev, category].sort((a, b) => a.label.localeCompare(b.label)));
    return category;
  }, []);

  const createAccount = useCallback(async (input: CreateAccountInput): Promise<Account> => {
    const result = await accountsApi.create(input);
    const account = unwrapApiResult(result).account;
    setAccounts((prev) => [account, ...prev]);
    return account;
  }, []);

  const createTransaction = useCallback(async (input: CreateTransactionInput): Promise<Transaction> => {
    const result = await transactionsApi.create(input);
    const transaction = unwrapApiResult(result).transaction;
    setTransactions((prev) => [transaction, ...prev]);
    setTransactionsRevision((prev) => prev + 1);

    const affectsBalance = input.affectsBalance ?? true;
    if (affectsBalance) {
      const delta = input.direction === 'received' ? input.amount : -input.amount;
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === input.accountId
            ? { ...account, amount: account.amount + delta }
            : account,
        ),
      );
    }

    return transaction;
  }, []);

  const createRecurringPayment = useCallback(async (input: CreateRecurringPaymentInput): Promise<RecurringPayment> => {
    const result = await recurringPaymentsApi.create(input);
    const recurringPayment = unwrapApiResult(result).recurringPayment;

    // Backfilled past occurrences update transactions and possibly stash balances.
    await refreshFinancials();

    return recurringPayment;
  }, [refreshFinancials]);

  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    const existing = transactions.find((t) => t.id === id);
    await unwrapApiResult(await transactionsApi.remove(id));
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setTransactionsRevision((prev) => prev + 1);

    if (existing?.affectsBalance) {
      const delta = existing.direction === 'received'
        ? -existing.amount
        : existing.amount;
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === existing.accountId
            ? { ...account, amount: account.amount + delta }
            : account,
        ),
      );
    }
  }, [transactions]);

  const value = useMemo<AppContextType>(() => ({
    categories,
    accounts,
    transactions,
    transactionsRevision,
    recurringPayments,
    isLoading,
    error,
    refreshFinancials,
    createCategory,
    createAccount,
    createTransaction,
    createRecurringPayment,
    deleteTransaction,
    goals,
    setGoals,
    investments,
    setInvestments,
    budgets,
    setBudgets,
  }), [
    categories,
    accounts,
    transactions,
    transactionsRevision,
    recurringPayments,
    isLoading,
    error,
    refreshFinancials,
    createCategory,
    createAccount,
    createTransaction,
    createRecurringPayment,
    deleteTransaction,
    goals,
    setGoals,
    investments,
    setInvestments,
    budgets,
    setBudgets,
  ]);

  return (
    <AppContext.Provider value={value}>
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
