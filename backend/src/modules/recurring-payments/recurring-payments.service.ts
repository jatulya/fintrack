import { accountsService } from '../accounts/accounts.service.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { recurringPaymentsRepository } from './recurring-payments.repository.js';
import {
  addFrequency,
  buildRecurringSchedule,
  formatDateOnly,
  parseDateOnly,
  todayDateOnly,
  collectDueDates
} from './recurring-schedule.js';
import { transactionsRepository } from '../transactions/transactions.repository.js';
import type {
  CreateRecurringPaymentInput,
  ProcessRecurringPaymentsResult,
  PublicRecurringPayment,
  RecurringPaymentFrequency,
  RecurringPaymentWithRelations,
  UpdateRecurringPaymentInput,
} from './recurring-payments.types.js';
import type { CreateTransactionInput } from '../transactions/transactions.types.js';
import { NotFoundError } from '../../utils/errors.js';
import { errorMessages } from '../../common/texts/strings.js';

function toPublicRecurringPayment(row: RecurringPaymentWithRelations): PublicRecurringPayment {
  return {
    id: row.id,
    accountId: row.account_id,
    accountName: row.accounts?.name ?? 'Unknown',
    categoryId: row.category_id,
    categoryLabel: row.categories?.label ?? 'Unknown',
    amount: Number(row.amount),
    direction: row.direction,
    frequency: row.frequency,
    startDate: row.start_date,
    nextRunAt: row.next_payment_date,
    notes: row.notes,
    affectsBalance: row.affects_balance,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function balanceDelta(direction: string, amount: number): number {
  return direction === 'received' ? amount : -amount;
}

/** Advance a date until it is strictly after today, using the given frequency. */
function advanceToFuture(
  fromDate: string,
  frequency: RecurringPaymentFrequency,
  today: string = todayDateOnly(),
): string {
  const todayDate = parseDateOnly(today);
  let cursor = parseDateOnly(fromDate);

  if (cursor > todayDate) {
    return formatDateOnly(cursor);
  }

  while (cursor <= todayDate) {
    cursor = addFrequency(cursor, frequency);
  }

  return formatDateOnly(cursor);
}
/** Prefer PostgREST/Supabase fields; fall back to Error.message. */
function getSupabaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const maybe = err as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [maybe.message, maybe.details, maybe.hint]
      .filter((part): part is string => typeof part === 'string' && part.length > 0);
    if (parts.length > 0) {
      const code = typeof maybe.code === 'string' && maybe.code ? ` (${maybe.code})` : '';
      return `${parts.join(' — ')}${code}`;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return String(err);
}

export class RecurringPaymentsService {
  constructor(
    private readonly repo = recurringPaymentsRepository,
    private readonly categoriesRepo = categoriesRepository,
    private readonly accounts = accountsService,
    private readonly transactionsRepo = transactionsRepository,
  ) {}

  async list(userId: string): Promise<PublicRecurringPayment[]> {
    const rows = await this.repo.findAllByUser(userId);
    return rows.map(toPublicRecurringPayment);
  }

  async getDueCount(userId: string): Promise<number> {
    return this.repo.countActiveDueByUser(userId, todayDateOnly());
  }

  async create(userId: string, input: CreateRecurringPaymentInput): Promise<PublicRecurringPayment> {
    const account = await this.accounts.getById(userId, input.accountId);
    if (!account) {
      throw new NotFoundError(errorMessages.financial.accountNotFound);
    }

    const category = await this.categoriesRepo.findById(userId, input.categoryId);
    if (!category) {
      throw new NotFoundError(errorMessages.financial.categoryNotFound);
    }

    const affectsBalance = input.affectsBalance ?? true;
    const { pastDates, nextPaymentDate } = buildRecurringSchedule(
      input.startDate,
      input.frequency,
    );

    const row = await this.repo.create(userId, input, nextPaymentDate);

    if (pastDates.length > 0) {
      const transactionInputs: CreateTransactionInput[] = pastDates.map((spentAt) => ({
        accountId: input.accountId,
        categoryId: input.categoryId,
        amount: input.amount,
        spentAt,
        notes: input.notes ?? '',
        direction: input.direction,
        affectsBalance,
      }));

      await this.transactionsRepo.createMany(userId, transactionInputs);

      if (affectsBalance) {
        const totalDelta = balanceDelta(input.direction, input.amount) * pastDates.length;
        await this.accounts.adjustAmount(userId, input.accountId, totalDelta);
      }
    }

    return {
      id: row.id,
      accountId: row.account_id,
      accountName: account.name,
      categoryId: row.category_id,
      categoryLabel: category.label,
      amount: Number(row.amount),
      direction: row.direction,
      frequency: row.frequency,
      startDate: row.start_date,
      nextRunAt: row.next_payment_date,
      notes: row.notes,
      affectsBalance: row.affects_balance,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Updates the recurring template only. Existing (past) transactions are left unchanged;
   * subsequent generated occurrences use the new values.
   */
  async update(
    userId: string,
    id: string,
    input: UpdateRecurringPaymentInput,
  ): Promise<PublicRecurringPayment> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) {
      throw new NotFoundError(errorMessages.financial.recurringPaymentNotFound);
    }

    const nextAccountId = input.accountId ?? existing.account_id;
    const nextCategoryId = input.categoryId ?? existing.category_id;
    const nextFrequency = input.frequency ?? existing.frequency;
    const nextIsActive = input.isActive ?? existing.is_active;

    const account = await this.accounts.getById(userId, nextAccountId);
    if (!account) {
      throw new NotFoundError(errorMessages.financial.accountNotFound);
    }

    const category = await this.categoriesRepo.findById(userId, nextCategoryId);
    if (!category) {
      throw new NotFoundError(errorMessages.financial.categoryNotFound);
    }

    let nextPaymentDate: string | undefined;
    const resuming = existing.is_active === false && nextIsActive === true;
    if (resuming) {
      // Skip missed occurrences while paused; resume from the next future date.
      nextPaymentDate = advanceToFuture(existing.next_payment_date, nextFrequency);
    }

    const row = await this.repo.update(userId, id, {
      ...input,
      ...(nextPaymentDate ? { nextPaymentDate } : {}),
    });

    return toPublicRecurringPayment(row);
  }

  /**
   * Soft-deletes the recurring template so no future entries are created.
   * Existing transactions generated from past runs are left unchanged.
   */
  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) {
      throw new NotFoundError(errorMessages.financial.recurringPaymentNotFound);
    }

    await this.repo.softDelete(userId, id);
  }
  //  * Creates missing transactions for active recurring payments whose next run
  //  * is on or before today (manual stand-in for a cron job).
  //  * Only advances next_payment_date when transactions are created successfully.
  //  */
  async processDue(userId: string): Promise<ProcessRecurringPaymentsResult> {
    const today = todayDateOnly();
    const duePayments = await this.repo.findActiveDueByUser(userId, today);

    let createdCount = 0;
    const items: ProcessRecurringPaymentsResult['items'] = [];

    for (const payment of duePayments) {
      const accountName = payment.accounts?.name ?? 'Unknown';
      const categoryLabel = payment.categories?.label ?? 'Unknown';
      const baseItem = {
        recurringPaymentId: payment.id,
        notes: payment.notes,
        amount: Number(payment.amount),
        direction: payment.direction,
        accountName,
        categoryLabel,
      };

      try {
        const { dueDates, nextPaymentDate } = collectDueDates(
          payment.next_payment_date,
          payment.frequency,
          today,
        );

        if (dueDates.length === 0) {
          continue;
        }

        const transactionInputs: CreateTransactionInput[] = dueDates.map((spentAt) => ({
          accountId: payment.account_id,
          categoryId: payment.category_id,
          amount: Number(payment.amount),
          spentAt,
          notes: payment.notes,
          direction: payment.direction,
          affectsBalance: payment.affects_balance,
        }));

        await this.transactionsRepo.createMany(userId, transactionInputs);
        await this.repo.updateNextPaymentDate(userId, payment.id, nextPaymentDate);
        createdCount += dueDates.length;

        try {
          if (payment.affects_balance) {
            const totalDelta =
              balanceDelta(payment.direction, Number(payment.amount)) * dueDates.length;
            await this.accounts.adjustAmount(userId, payment.account_id, totalDelta);
          }

          items.push({
            ...baseItem,
            createdCount: dueDates.length,
            skippedCount: 0,
            status: 'created',
            reason: null,
          });
        } catch (balanceErr) {
          items.push({
            ...baseItem,
            createdCount: dueDates.length,
            skippedCount: 0,
            status: 'partial',
            reason: getSupabaseErrorMessage(balanceErr),
          });
        }
      } catch (err) {
        items.push({
          ...baseItem,
          createdCount: 0,
          skippedCount: 0,
          status: 'failed',
          reason: getSupabaseErrorMessage(err),
        });
      }
    }

    const recurringPayments = await this.list(userId);

    return {
      processedCount: duePayments.length,
      createdCount,
      items,
      recurringPayments,
    };
  }
}

export const recurringPaymentsService = new RecurringPaymentsService();
