export type TransactionDirection = 'received' | 'spent';

export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  spent_at: string;
  notes: string;
  direction: TransactionDirection;
  affects_balance: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TransactionWithCategory extends TransactionRow {
  categories: {
    name: string;
    label: string;
  } | null;
}

export interface PublicTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  categoryLabel: string;
  amount: number;
  spentAt: string;
  notes: string;
  direction: TransactionDirection;
  affectsBalance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId: string;
  amount: number;
  spentAt: string;
  notes?: string;
  direction: TransactionDirection;
  affectsBalance?: boolean;
}
