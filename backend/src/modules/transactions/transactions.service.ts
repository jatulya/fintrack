import { accountsService } from '../accounts/accounts.service.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { transactionsRepository } from './transactions.repository.js';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  PaginatedTransactions,
  PublicTransaction,
  TransactionWithCategory,
  UpdateTransactionInput,
} from './transactions.types.js';
import { NotFoundError } from '../../utils/errors.js';
import { errorMessages } from '../../common/texts/strings.js';

function toPublicTransaction(row: TransactionWithCategory): PublicTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    categoryLabel: row.categories?.label ?? 'Unknown',
    amount: Number(row.amount),
    spentAt: row.spent_at,
    notes: row.notes,
    direction: row.direction,
    affectsBalance: row.affects_balance,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function balanceDelta(direction: string, amount: number): number {
  return direction === 'received' ? amount : -amount;
}

export class TransactionsService {
  constructor(
    private readonly repo = transactionsRepository,
    private readonly categoriesRepo = categoriesRepository,
    private readonly accounts = accountsService,
  ) {}

  async list(userId: string, query: ListTransactionsQuery): Promise<PaginatedTransactions> {
    const { rows, hasMore } = await this.repo.findPaginatedByUser(userId, query);
    return {
      transactions: rows.map(toPublicTransaction),
      hasMore,
    };
  }

  async create(userId: string, input: CreateTransactionInput): Promise<PublicTransaction> {
    const account = await this.accounts.getById(userId, input.accountId);
    if (!account) {
      throw new NotFoundError(errorMessages.financial.accountNotFound);
    }

    const category = await this.categoriesRepo.findById(userId, input.categoryId);
    if (!category) {
      throw new NotFoundError(errorMessages.financial.categoryNotFound);
    }

    const row = await this.repo.create(userId, input);

    const affectsBalance = input.affectsBalance ?? true;
    if (affectsBalance) {
      await this.accounts.adjustAmount(
        userId,
        input.accountId,
        balanceDelta(input.direction, input.amount),
      );
    }

    return {
      id: row.id,
      accountId: row.account_id,
      categoryId: row.category_id,
      categoryLabel: category.label,
      amount: Number(row.amount),
      spentAt: row.spent_at,
      notes: row.notes,
      direction: row.direction,
      affectsBalance: row.affects_balance,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async update(userId: string, id: string, input: UpdateTransactionInput): Promise<PublicTransaction> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) {
      throw new NotFoundError(errorMessages.financial.transactionNotFound);
    }

    const nextAccountId = input.accountId ?? existing.account_id;
    const nextCategoryId = input.categoryId ?? existing.category_id;
    const nextAmount = input.amount ?? Number(existing.amount);
    const nextSpentAt = input.spentAt ?? existing.spent_at;
    const nextNotes = input.notes ?? existing.notes;
    const nextDirection = input.direction ?? existing.direction;
    const nextAffectsBalance = input.affectsBalance ?? existing.affects_balance;

    const account = await this.accounts.getById(userId, nextAccountId);
    if (!account) {
      throw new NotFoundError(errorMessages.financial.accountNotFound);
    }

    const category = await this.categoriesRepo.findById(userId, nextCategoryId);
    if (!category) {
      throw new NotFoundError(errorMessages.financial.categoryNotFound);
    }

    if (existing.affects_balance) {
      await this.accounts.adjustAmount(
        userId,
        existing.account_id,
        -balanceDelta(existing.direction, Number(existing.amount)),
      );
    }

    const row = await this.repo.update(userId, id, {
      accountId: nextAccountId,
      categoryId: nextCategoryId,
      amount: nextAmount,
      spentAt: nextSpentAt,
      notes: nextNotes,
      direction: nextDirection,
      affectsBalance: nextAffectsBalance,
    });

    if (nextAffectsBalance) {
      await this.accounts.adjustAmount(
        userId,
        nextAccountId,
        balanceDelta(nextDirection, nextAmount),
      );
    }

    return toPublicTransaction(row);
  }

  async delete(userId: string, id: string): Promise<void> {
    const transaction = await this.repo.findById(userId, id);
    if (!transaction) {
      throw new NotFoundError(errorMessages.financial.transactionNotFound);
    }

    if (transaction.affects_balance) {
      await this.accounts.adjustAmount(
        userId,
        transaction.account_id,
        -balanceDelta(transaction.direction, Number(transaction.amount)),
      );
    }
    await this.repo.softDelete(userId, id);
  }
}

export const transactionsService = new TransactionsService();
