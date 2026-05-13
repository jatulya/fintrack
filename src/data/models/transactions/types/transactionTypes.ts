export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
  Transfer = 'Transfer',
}

export interface SplitCategory {
  category: string;
  amount: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  targetAccountId?: string; // For transfers
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
  receiptImage?: string;
  isRecurring: boolean;
  recurringId?: string;
  splits?: SplitCategory[];
}

export interface RecurringTemplate {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;
  nextDate: string;
}
