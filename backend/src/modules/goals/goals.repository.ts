import { supabaseAdmin } from '../../config/supabase.js';
import type { CreateGoalInput, GoalRecurringPaymentRow, GoalRow } from './goals.types.js';

const GOALS_TABLE = 'goals';
const LINKS_TABLE = 'goal_recurring_payments';

export class GoalsRepository {
  async findAllByUser(userId: string): Promise<GoalRow[]> {
    const { data, error } = await supabaseAdmin
      .from(GOALS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as GoalRow[];
  }

  async findById(userId: string, id: string): Promise<GoalRow | null> {
    const { data, error } = await supabaseAdmin
      .from(GOALS_TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as GoalRow | null;
  }

  async create(userId: string, input: CreateGoalInput): Promise<GoalRow> {
    const { data, error } = await supabaseAdmin
      .from(GOALS_TABLE)
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? '',
        target_date: input.targetDate,
        target_amount: input.targetAmount,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as GoalRow;
  }

  async findLinksByGoalIds(goalIds: string[]): Promise<GoalRecurringPaymentRow[]> {
    if (goalIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(LINKS_TABLE)
      .select('*')
      .in('goal_id', goalIds);

    if (error) throw error;
    return (data ?? []) as GoalRecurringPaymentRow[];
  }

  async replaceLinks(goalId: string, recurringPaymentIds: string[]): Promise<void> {
    const { error: deleteError } = await supabaseAdmin
      .from(LINKS_TABLE)
      .delete()
      .eq('goal_id', goalId);

    if (deleteError) throw deleteError;

    if (recurringPaymentIds.length === 0) return;

    const rows = recurringPaymentIds.map((recurringPaymentId) => ({
      goal_id: goalId,
      recurring_payment_id: recurringPaymentId,
    }));

    const { error: insertError } = await supabaseAdmin.from(LINKS_TABLE).insert(rows);
    if (insertError) throw insertError;
  }
}

export const goalsRepository = new GoalsRepository();
