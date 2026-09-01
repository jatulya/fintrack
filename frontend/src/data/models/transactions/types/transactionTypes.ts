export type TransactionDirection = 'received' | 'spent';

export interface Transaction {
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

export interface UpdateTransactionInput {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  spentAt?: string;
  notes?: string;
  direction?: TransactionDirection;
  affectsBalance?: boolean;
}

export type TransactionSortField = 'spentAt' | 'amount';

export interface ListTransactionsParams {
  limit?: number;
  offset?: number;
  direction?: TransactionDirection;
  accountId?: string;
  categoryId?: string;
  categoryIds?: string[];
  spentFrom?: string;
  spentTo?: string;
  search?: string;
  sortBy?: TransactionSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTransactionList {
  transactions: Transaction[];
  hasMore: boolean;
}

export const TRANSACTIONS_PAGE_SIZE = 25;
