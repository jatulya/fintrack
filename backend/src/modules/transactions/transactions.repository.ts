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
}

export const transactionsRepository = new TransactionsRepository();
