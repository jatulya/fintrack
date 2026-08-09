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

export interface UpdateRecurringPaymentInput {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  direction?: RecurringPaymentDirection;
  frequency?: RecurringPaymentFrequency;
  notes?: string;
  affectsBalance?: boolean;
  isActive?: boolean;
}

export type ProcessRecurringPaymentItemStatus = 'created' | 'skipped' | 'partial' | 'failed';

export interface ProcessRecurringPaymentItem {
  recurringPaymentId: string;
  notes: string;
  amount: number;
  direction: RecurringPaymentDirection;
  accountName: string;
  categoryLabel: string;
  createdCount: number;
  skippedCount: number;
  status: ProcessRecurringPaymentItemStatus;
  reason: string | null;
}

export interface ProcessRecurringPaymentsResult {
  processedCount: number;
  createdCount: number;
  items: ProcessRecurringPaymentItem[];
  recurringPayments: RecurringPayment[];
}

export const RECURRING_FREQUENCY_LABELS: Record<RecurringPaymentFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};
