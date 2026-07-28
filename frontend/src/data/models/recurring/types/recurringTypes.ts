import type { TransactionDirection } from '../../transactions/types/transactionTypes';

export type RecurringPaymentDirection = TransactionDirection;
export type RecurringPaymentFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringPayment {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryLabel: string;
  amount: number;
  direction: RecurringPaymentDirection;
  frequency: RecurringPaymentFrequency;
  startDate: string;
  nextRunAt: string;
  notes: string;
  affectsBalance: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringPaymentInput {
  accountId: string;
  categoryId: string;
  amount: number;
  direction: RecurringPaymentDirection;
  frequency: RecurringPaymentFrequency;
  startDate: string;
  notes?: string;
  affectsBalance?: boolean;
}

export interface ProcessRecurringPaymentsResult {
  processedCount: number;
  createdCount: number;
  recurringPayments: RecurringPayment[];
}

export const RECURRING_FREQUENCY_LABELS: Record<RecurringPaymentFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};
