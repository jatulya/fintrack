import { errorMessages } from '../../common/texts/strings.js';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';
import { recurringPaymentsRepository } from '../recurring-payments/recurring-payments.repository.js';
import { buildRecurringSchedule } from '../recurring-payments/recurring-schedule.js';
import type {
  RecurringPaymentFrequency,
  RecurringPaymentRow,
} from '../recurring-payments/recurring-payments.types.js';
import { transactionsRepository } from '../transactions/transactions.repository.js';
import type { TransactionWithCategory } from '../transactions/transactions.types.js';
import { goalsRepository } from './goals.repository.js';
import type {
  CreateGoalInput,
  GoalLinkedRecurringPayment,
  GoalLinkedTransaction,
  GoalRow,
  GoalsListResult,
  GoalsPoolMetrics,
  GoalStatus,
  PublicGoal,
  UpdateGoalInput,
} from './goals.types.js';

function monthlyNormalizedAmount(amount: number, frequency: RecurringPaymentFrequency): number {
  switch (frequency) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'yearly':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
}

function contributedFromRecurring(recurring: RecurringPaymentRow): number {
  const { pastDates } = buildRecurringSchedule(recurring.start_date, recurring.frequency);
  return pastDates.length * Number(recurring.amount);
}

function contributedFromTransaction(tx: TransactionWithCategory): number {
  const amount = Number(tx.amount);
  return tx.direction === 'spent' ? amount : -amount;
}

function toLinkedRecurring(row: RecurringPaymentRow): GoalLinkedRecurringPayment {
  return {
    id: row.id,
    notes: row.notes,
    amount: Number(row.amount),
    frequency: row.frequency,
    direction: row.direction,
    isActive: row.is_active,
    startDate: row.start_date,
  };
}

function toLinkedTransaction(row: TransactionWithCategory): GoalLinkedTransaction {
  return {
    id: row.id,
    notes: row.notes,
    amount: Number(row.amount),
    direction: row.direction,
    spentAt: row.spent_at,
    categoryLabel: row.categories?.label ?? row.categories?.name ?? '',
  };
}

function resolveStatus(
  recurrings: RecurringPaymentRow[],
  transactions: TransactionWithCategory[],
): GoalStatus {
  const hasActiveRecurring = recurrings.some((item) => item.is_active);
  const hasTransactions = transactions.length > 0;

  if (recurrings.length > 0 && !hasActiveRecurring && !hasTransactions) {
    return 'closed';
  }

  return 'active';
}

function enrichGoal(
  row: GoalRow,
  recurrings: RecurringPaymentRow[],
  transactions: TransactionWithCategory[],
): PublicGoal {
  const targetAmount = Number(row.target_amount);
  const fromRecurring = recurrings.reduce((sum, item) => sum + contributedFromRecurring(item), 0);
  const fromTransactions = transactions.reduce(
    (sum, item) => sum + contributedFromTransaction(item),
    0,
  );
  const rawCurrent = Math.max(0, fromRecurring + fromTransactions);
  const currentAmount = Math.min(rawCurrent, targetAmount);
  const remaining = Math.max(0, targetAmount - currentAmount);
  const progressPercent = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
  const monthlyContribution = recurrings
    .filter((item) => item.is_active)
    .reduce((sum, item) => sum + monthlyNormalizedAmount(Number(item.amount), item.frequency), 0);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    targetDate: row.target_date,
    targetAmount,
    status: row.status,
    currentAmount,
    remaining,
    progressPercent,
    monthlyContribution: Math.round(monthlyContribution),
    recurringPayments: recurrings.map(toLinkedRecurring),
    transactions: transactions.map(toLinkedTransaction),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computePoolMetrics(goals: PublicGoal[]): GoalsPoolMetrics {
  const activeGoals = goals.filter((goal) => goal.status === 'active');
  const totalCollected = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const amountToCollect = Math.max(0, totalTarget - totalCollected);
  const overallRate = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  return {
    totalCollected,
    totalTarget,
    amountToCollect,
    overallRate,
  };
}

export class GoalsService {
  constructor(
    private readonly repo = goalsRepository,
    private readonly recurringRepo = recurringPaymentsRepository,
    private readonly transactionsRepo = transactionsRepository,
  ) {}

  private async loadRecurringsByIds(
    userId: string,
    ids: string[],
  ): Promise<Map<string, RecurringPaymentRow>> {
    const uniqueIds = [...new Set(ids)];
    const rows = await this.recurringRepo.findByIds(userId, uniqueIds);
    return new Map(rows.map((row) => [row.id, row]));
  }

  private async loadTransactionsByIds(
    userId: string,
    ids: string[],
  ): Promise<Map<string, TransactionWithCategory>> {
    const uniqueIds = [...new Set(ids)];
    const rows = await this.transactionsRepo.findByIds(userId, uniqueIds);
    return new Map(rows.map((row) => [row.id, row]));
  }

  private async assertAssignableRecurrings(
    userId: string,
    ids: string[],
    excludeGoalId?: string,
  ): Promise<RecurringPaymentRow[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];
    const recurrings = await this.recurringRepo.findByIds(userId, uniqueIds);
    if (recurrings.length !== uniqueIds.length) {
      throw new NotFoundError(errorMessages.financial.recurringPaymentNotFound);
    }

    if (recurrings.some((row) => row.direction === 'received')) {
      throw new ValidationError(errorMessages.financial.creditRecurringNotAllowed);
    }

    const taken = new Set(await this.repo.findLinkedRecurringPaymentIds(userId, excludeGoalId));
    if (uniqueIds.some((id) => taken.has(id))) {
      throw new ConflictError(errorMessages.financial.recurringAlreadyLinked);
    }

    return recurrings;
  }

  private async assertAssignableTransactions(
    userId: string,
    ids: string[],
    excludeGoalId?: string,
  ): Promise<TransactionWithCategory[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];
    const transactions = await this.transactionsRepo.findByIds(userId, uniqueIds);
    if (transactions.length !== uniqueIds.length) {
      throw new NotFoundError(errorMessages.financial.transactionNotFound);
    }

    const taken = new Set(await this.repo.findLinkedTransactionIds(userId, excludeGoalId));
    if (uniqueIds.some((id) => taken.has(id))) {
      throw new ConflictError(errorMessages.financial.transactionAlreadyLinked);
    }

    return transactions;
  }

  private async enrichGoals(userId: string, rows: GoalRow[]): Promise<PublicGoal[]> {
    if (rows.length === 0) return [];

    const goalIds = rows.map((row) => row.id);
    const [recurringLinks, transactionLinks] = await Promise.all([
      this.repo.findRecurringLinksByGoalIds(goalIds),
      this.repo.findTransactionLinksByGoalIds(goalIds),
    ]);

    const recurringById = await this.loadRecurringsByIds(
      userId,
      recurringLinks.map((link) => link.recurring_payment_id),
    );
    const transactionById = await this.loadTransactionsByIds(
      userId,
      transactionLinks.map((link) => link.transaction_id),
    );

    const recurringsByGoal = new Map<string, RecurringPaymentRow[]>();
    for (const link of recurringLinks) {
      const recurring = recurringById.get(link.recurring_payment_id);
      if (!recurring) continue;
      const existing = recurringsByGoal.get(link.goal_id) ?? [];
      existing.push(recurring);
      recurringsByGoal.set(link.goal_id, existing);
    }

    const transactionsByGoal = new Map<string, TransactionWithCategory[]>();
    for (const link of transactionLinks) {
      const transaction = transactionById.get(link.transaction_id);
      if (!transaction) continue;
      const existing = transactionsByGoal.get(link.goal_id) ?? [];
      existing.push(transaction);
      transactionsByGoal.set(link.goal_id, existing);
    }

    const enriched: PublicGoal[] = [];
    for (const row of rows) {
      const recurrings = recurringsByGoal.get(row.id) ?? [];
      const transactions = transactionsByGoal.get(row.id) ?? [];
      const nextStatus = resolveStatus(recurrings, transactions);

      let statusRow = row;
      if (row.status !== nextStatus) {
        await this.repo.updateStatus(userId, row.id, nextStatus);
        statusRow = { ...row, status: nextStatus };
      }

      enriched.push(enrichGoal(statusRow, recurrings, transactions));
    }

    return enriched;
  }

  async list(userId: string): Promise<GoalsListResult> {
    const rows = await this.repo.findAllByUser(userId);
    const goals = await this.enrichGoals(userId, rows);
    return {
      goals,
      metrics: computePoolMetrics(goals),
    };
  }

  async create(userId: string, input: CreateGoalInput): Promise<PublicGoal> {
    const recurringIds = [...new Set(input.recurringPaymentIds ?? [])];
    const transactionIds = [...new Set(input.transactionIds ?? [])];

    if (recurringIds.length === 0 && transactionIds.length === 0) {
      throw new ValidationError(errorMessages.financial.goalNeedsFundingSource);
    }

    const [recurrings, transactions] = await Promise.all([
      this.assertAssignableRecurrings(userId, recurringIds),
      this.assertAssignableTransactions(userId, transactionIds),
    ]);

    const status = resolveStatus(recurrings, transactions);
    const row = await this.repo.create(userId, input, status);
    await Promise.all([
      this.repo.replaceRecurringLinks(row.id, recurringIds),
      this.repo.replaceTransactionLinks(row.id, transactionIds),
    ]);

    return enrichGoal(row, recurrings, transactions);
  }

  async update(userId: string, id: string, input: UpdateGoalInput): Promise<PublicGoal> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) {
      throw new NotFoundError(errorMessages.financial.goalNotFound);
    }

    const currentRecurringLinks = await this.repo.findRecurringLinksByGoalIds([id]);
    const currentTransactionLinks = await this.repo.findTransactionLinksByGoalIds([id]);

    const recurringIds =
      input.recurringPaymentIds !== undefined
        ? [...new Set(input.recurringPaymentIds)]
        : currentRecurringLinks.map((link) => link.recurring_payment_id);

    const transactionIds =
      input.transactionIds !== undefined
        ? [...new Set(input.transactionIds)]
        : currentTransactionLinks.map((link) => link.transaction_id);

    if (recurringIds.length === 0 && transactionIds.length === 0) {
      throw new ValidationError(errorMessages.financial.goalNeedsFundingSource);
    }

    const [recurrings, transactions] = await Promise.all([
      this.assertAssignableRecurrings(userId, recurringIds, id),
      this.assertAssignableTransactions(userId, transactionIds, id),
    ]);

    const status = resolveStatus(recurrings, transactions);
    const row = await this.repo.update(userId, id, input, status);

    if (input.recurringPaymentIds !== undefined) {
      await this.repo.replaceRecurringLinks(id, recurringIds);
    }
    if (input.transactionIds !== undefined) {
      await this.repo.replaceTransactionLinks(id, transactionIds);
    }

    return enrichGoal(row, recurrings, transactions);
  }
}

export const goalsService = new GoalsService();
