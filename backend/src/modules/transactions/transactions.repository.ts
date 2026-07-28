import { supabaseAdmin } from '../../config/supabase.js';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  TransactionRow,
  TransactionWithCategory,
} from './transactions.types.js';

const TABLE = 'transactions';

export class TransactionsRepository {
  async findPaginatedByUser(
    userId: string,
    query: ListTransactionsQuery,
  ): Promise<{ rows: TransactionWithCategory[]; hasMore: boolean }> {
    const sortColumn = query.sortBy === 'amount' ? 'amount' : 'spent_at';
    const ascending = query.sortOrder === 'asc';

    let request = supabaseAdmin
      .from(TABLE)
      .select('*, categories(name, label)')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (query.direction) {
      request = request.eq('direction', query.direction);
    }

    if (query.accountId) {
      request = request.eq('account_id', query.accountId);
    }

    if (query.categoryId) {
      request = request.eq('category_id', query.categoryId);
    }

    if (query.search) {
      const term = `%${query.search}%`;
      request = request.or(`notes.ilike.${term},categories.name.ilike.${term}`);
    }

    const { data, error } = await request
      .order(sortColumn, { ascending })
      .order('id', { ascending })
      .range(query.offset, query.offset + query.limit);

    if (error) throw error;

    const rows = (data ?? []) as TransactionWithCategory[];
    const hasMore = rows.length > query.limit;

    return {
      rows: hasMore ? rows.slice(0, query.limit) : rows,
      hasMore,
    };
  }

  async create(userId: string, input: CreateTransactionInput): Promise<TransactionRow> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        user_id: userId,
        account_id: input.accountId,
        category_id: input.categoryId,
        amount: input.amount,
        spent_at: input.spentAt,
        notes: input.notes ?? '',
        direction: input.direction,
        affects_balance: input.affectsBalance ?? true,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as TransactionRow;
  }

  async createMany(userId: string, inputs: CreateTransactionInput[]): Promise<TransactionRow[]> {
    if (inputs.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(
        inputs.map((input) => ({
          user_id: userId,
          account_id: input.accountId,
          category_id: input.categoryId,
          amount: input.amount,
          spent_at: input.spentAt,
          notes: input.notes ?? '',
          direction: input.direction,
          affects_balance: input.affectsBalance ?? true,
        })),
      )
      .select('*');

    if (error) throw error;
    return (data ?? []) as TransactionRow[];
  }

  async findById(userId: string, id: string): Promise<TransactionRow | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as TransactionRow | null;
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw error;
  }

  /**
   * Returns date-only spent_at values that already have a matching transaction
   * for the given recurring fingerprint (account, category, amount, direction).
   */
  async findExistingOccurrenceDates(
    userId: string,
    input: {
      accountId: string;
      categoryId: string;
      amount: number;
      direction: 'received' | 'spent';
      spentAts: string[];
    },
  ): Promise<Set<string>> {
    if (input.spentAts.length === 0) {
      return new Set();
    }

    const sortedDates = [...input.spentAts].sort();
    const minDate = sortedDates[0];
    const maxDate = sortedDates[sortedDates.length - 1];

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('spent_at')
      .eq('user_id', userId)
      .eq('account_id', input.accountId)
      .eq('category_id', input.categoryId)
      .eq('amount', input.amount)
      .eq('direction', input.direction)
      .is('deleted_at', null)
      .gte('spent_at', minDate)
      .lte('spent_at', `${maxDate}T23:59:59.999Z`);

    if (error) throw error;

    const wanted = new Set(input.spentAts);
    const existing = new Set<string>();

    for (const row of data ?? []) {
      const dateOnly = String(row.spent_at).substring(0, 10);
      if (wanted.has(dateOnly)) {
        existing.add(dateOnly);
      }
    }

    return existing;
  }

  async findAllWithCategoryForUser(userId: string): Promise<TransactionWithCategory[]> {
    const pageSize = 1000;
    let offset = 0;
    const rows: TransactionWithCategory[] = [];

    while (true) {
      const { data, error } = await supabaseAdmin
        .from(TABLE)
        .select('*, categories(name, label)')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('spent_at', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const page = (data ?? []) as TransactionWithCategory[];
      rows.push(...page);

      if (page.length < pageSize) {
        break;
      }

      offset += pageSize;
    }

    return rows;
  }
}

export const transactionsRepository = new TransactionsRepository();
