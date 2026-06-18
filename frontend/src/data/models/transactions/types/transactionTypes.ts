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
