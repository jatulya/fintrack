import { accountsRepository } from './accounts.repository.js';
import type { AccountRow, CreateAccountInput, PublicAccount } from './accounts.types.js';

function toPublicAccount(row: AccountRow): PublicAccount {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AccountsService {
  constructor(private readonly repo = accountsRepository) {}

  async list(userId: string): Promise<PublicAccount[]> {
    const rows = await this.repo.findAllByUser(userId);
    return rows.map(toPublicAccount);
  }

  async create(userId: string, input: CreateAccountInput): Promise<PublicAccount> {
    const row = await this.repo.create(userId, input);
    return toPublicAccount(row);
  }

  async getById(userId: string, id: string): Promise<AccountRow | null> {
    return this.repo.findById(userId, id);
  }

  async adjustAmount(userId: string, id: string, delta: number): Promise<PublicAccount> {
    const account = await this.repo.findById(userId, id);
    if (!account) {
      throw new Error('Account not found');
    }

    const newAmount = Number(account.amount) + delta;
    const updated = await this.repo.updateAmount(userId, id, newAmount);
    return toPublicAccount(updated);
  }
}

export const accountsService = new AccountsService();
