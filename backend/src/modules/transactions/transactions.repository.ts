import { supabaseAdmin } from '../../config/supabase.js';
import type { CreateTransactionInput, TransactionRow, TransactionWithCategory } from './transactions.types.js';

const TABLE = 'transactions';

export class TransactionsRepository {
  async findAllByUser(userId: string): Promise<TransactionWithCategory[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*, categories(name, label)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('spent_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as TransactionWithCategory[];
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
