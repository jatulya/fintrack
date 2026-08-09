import { errorMessages } from '../../common/texts/strings.js';
import { NotFoundError } from '../../utils/errors.js';
import { recurringPaymentsRepository } from '../recurring-payments/recurring-payments.repository.js';
import { buildRecurringSchedule } from '../recurring-payments/recurring-schedule.js';
import type {
  RecurringPaymentFrequency,
  RecurringPaymentRow,
} from '../recurring-payments/recurring-payments.types.js';
import { goalsRepository } from './goals.repository.js';
import type {
  CreateGoalInput,
  GoalLinkedRecurringPayment,
  GoalRow,
  GoalsListResult,
  GoalsPoolMetrics,
  PublicGoal,
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

function contributedAmount(recurring: RecurringPaymentRow): number {
  const { pastDates } = buildRecurringSchedule(recurring.start_date, recurring.frequency);
  return pastDates.length * Number(recurring.amount);
}

function toLinkedSummary(row: RecurringPaymentRow): GoalLinkedRecurringPayment {
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

function enrichGoal(row: GoalRow, linked: RecurringPaymentRow[]): PublicGoal {
  const targetAmount = Number(row.target_amount);
  const rawCurrent = linked.reduce((sum, item) => sum + contributedAmount(item), 0);
  const currentAmount = Math.min(rawCurrent, targetAmount);
  const remaining = Math.max(0, targetAmount - currentAmount);
  const progressPercent = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
  const monthlyContribution = linked
    .filter((item) => item.is_active)
    .reduce((sum, item) => sum + monthlyNormalizedAmount(Number(item.amount), item.frequency), 0);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    targetDate: row.target_date,
    targetAmount,
    currentAmount,
    remaining,
    progressPercent,
    monthlyContribution: Math.round(monthlyContribution),
    recurringPayments: linked.map(toLinkedSummary),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computePoolMetrics(goals: PublicGoal[]): GoalsPoolMetrics {
  const totalCollected = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
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
  ) {}

  private async loadRecurringsByIds(
    userId: string,
    ids: string[],
  ): Promise<Map<string, RecurringPaymentRow>> {
    const uniqueIds = [...new Set(ids)];
    const rows = await this.recurringRepo.findByIds(userId, uniqueIds);
    return new Map(rows.map((row) => [row.id, row]));
  }

  private async enrichGoals(userId: string, rows: GoalRow[]): Promise<PublicGoal[]> {
    if (rows.length === 0) return [];

    const links = await this.repo.findLinksByGoalIds(rows.map((row) => row.id));
    const recurringIds = links.map((link) => link.recurring_payment_id);
    const recurringById = await this.loadRecurringsByIds(userId, recurringIds);

    const linksByGoal = new Map<string, RecurringPaymentRow[]>();
    for (const link of links) {
      const recurring = recurringById.get(link.recurring_payment_id);
      if (!recurring) continue;
      const existing = linksByGoal.get(link.goal_id) ?? [];
      existing.push(recurring);
      linksByGoal.set(link.goal_id, existing);
    }

    return rows.map((row) => enrichGoal(row, linksByGoal.get(row.id) ?? []));
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
    const uniqueIds = [...new Set(input.recurringPaymentIds)];
    if (uniqueIds.length === 0) {
      throw new NotFoundError(errorMessages.financial.recurringPaymentNotFound);
    }

    const recurrings = await this.recurringRepo.findByIds(userId, uniqueIds);
    if (recurrings.length !== uniqueIds.length) {
      throw new NotFoundError(errorMessages.financial.recurringPaymentNotFound);
    }

    const row = await this.repo.create(userId, {
      ...input,
      recurringPaymentIds: uniqueIds,
    });
    await this.repo.replaceLinks(row.id, uniqueIds);

    return enrichGoal(row, recurrings);
  }
}

export const goalsService = new GoalsService();
