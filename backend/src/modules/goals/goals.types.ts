import type { RecurringPaymentFrequency } from '../recurring-payments/recurring-payments.types.js';
import type { TransactionDirection } from '../transactions/transactions.types.js';

export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_date: string;
  target_amount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GoalRecurringPaymentRow {
  goal_id: string;
  recurring_payment_id: string;
  created_at: string;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  targetDate: string;
  targetAmount: number;
  recurringPaymentIds: string[];
}

export interface GoalLinkedRecurringPayment {
  id: string;
  notes: string;
  amount: number;
  frequency: RecurringPaymentFrequency;
  direction: TransactionDirection;
  isActive: boolean;
  startDate: string;
}

export interface PublicGoal {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  progressPercent: number;
  monthlyContribution: number;
  recurringPayments: GoalLinkedRecurringPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalsPoolMetrics {
  totalCollected: number;
  totalTarget: number;
  amountToCollect: number;
  overallRate: number;
}

export interface GoalsListResult {
  goals: PublicGoal[];
  metrics: GoalsPoolMetrics;
}
