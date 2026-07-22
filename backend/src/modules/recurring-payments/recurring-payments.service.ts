import { accountsService } from '../accounts/accounts.service.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { recurringPaymentsRepository } from './recurring-payments.repository.js';
import { buildRecurringSchedule } from './recurring-schedule.js';
import { transactionsRepository } from '../transactions/transactions.repository.js';
import type {
  CreateRecurringPaymentInput,
  PublicRecurringPayment,
  RecurringPaymentWithRelations,
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
}

export const recurringPaymentsService = new RecurringPaymentsService();
