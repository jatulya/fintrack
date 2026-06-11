import { supabaseAdmin } from '../../config/supabase.js';
import type { AccountRow, CreateAccountInput } from './accounts.types.js';

const TABLE = 'accounts';

export class AccountsRepository {
  async findAllByUser(userId: string): Promise<AccountRow[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as AccountRow[];
  }

  async findById(userId: string, id: string): Promise<AccountRow | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as AccountRow | null;
  }

  async create(userId: string, input: CreateAccountInput): Promise<AccountRow> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        user_id: userId,
        name: input.name,
        amount: input.amount ?? 0,
        notes: input.notes ?? '',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as AccountRow;
  }

  async updateAmount(userId: string, id: string, amount: number): Promise<AccountRow> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ amount })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) throw error;
    return data as AccountRow;
  }
}

export const accountsRepository = new AccountsRepository();
