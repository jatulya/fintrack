import type { RecurringPaymentFrequency } from '../../recurring/types/recurringTypes';
import type { TransactionDirection } from '../../transactions/types/transactionTypes';

export interface GoalLinkedRecurringPayment {
  id: string;
  notes: string;
  amount: number;
  frequency: RecurringPaymentFrequency;
  direction: TransactionDirection;
  isActive: boolean;
  startDate: string;
}

export interface SavingsGoal {
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

export interface CreateGoalInput {
  name: string;
  description?: string;
  targetDate: string;
  targetAmount: number;
  recurringPaymentIds: string[];
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  lastUpdated: string;
}
