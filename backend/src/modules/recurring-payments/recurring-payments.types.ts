import type { MoneyEntryFields } from "../transactions/money-entry.shared.js";
import type { TransactionDirection } from "../transactions/transactions.types.js";

export type RecurringPaymentDirection = TransactionDirection;
export type RecurringPaymentFrequency = "weekly" | "monthly" | "yearly";

export interface RecurringPaymentRow {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  direction: RecurringPaymentDirection;
  frequency: RecurringPaymentFrequency;
  start_date: string;
  next_payment_date: string;
  notes: string;
  affects_balance: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RecurringPaymentWithRelations extends RecurringPaymentRow {
  categories: {
    name: string;
    label: string;
  } | null;
  accounts: {
    name: string;
  } | null;
}

export interface PublicRecurringPayment {
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
  /** Why nothing (or not everything) was created; null when fully created. */
  reason: string | null;
}

export interface ProcessRecurringPaymentsResult {
  processedCount: number;
  createdCount: number;
  items: ProcessRecurringPaymentItem[];
  recurringPayments: PublicRecurringPayment[];
}

export interface CreateRecurringPaymentInput extends MoneyEntryFields {
  frequency: RecurringPaymentFrequency;
  startDate: string;
}
