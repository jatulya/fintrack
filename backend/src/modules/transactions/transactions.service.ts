import { accountsService } from '../accounts/accounts.service.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { transactionsRepository } from './transactions.repository.js';
import type {
  CreateTransactionInput,
  PublicTransaction,
  TransactionWithCategory,
} from './transactions.types.js';
import { NotFoundError } from '../../utils/errors.js';
import { errorMessages } from '../../common/texts/strings.js';

function toPublicTransaction(row: TransactionWithCategory): PublicTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? 'Unknown',
    categoryLabel: row.categories?.label ?? '',
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

  async list(userId: string): Promise<PublicTransaction[]> {
    const rows = await this.repo.findAllByUser(userId);
    return rows.map(toPublicTransaction);
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
      categoryName: category.name,
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
