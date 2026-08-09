import { supabaseAdmin } from '../../config/supabase.js';
import type {
  CreateGoalInput,
  GoalRecurringPaymentRow,
  GoalRow,
  GoalStatus,
  GoalTransactionRow,
  UpdateGoalInput,
} from './goals.types.js';

const GOALS_TABLE = 'goals';
const RECURRING_LINKS_TABLE = 'goal_recurring_payments';
const TRANSACTION_LINKS_TABLE = 'goal_transactions';

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

  async create(
    userId: string,
    input: CreateGoalInput,
    status: GoalStatus,
  ): Promise<GoalRow> {
    const { data, error } = await supabaseAdmin
      .from(GOALS_TABLE)
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? '',
        target_date: input.targetDate,
        target_amount: input.targetAmount,
        status,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as GoalRow;
  }

  async update(
    userId: string,
    id: string,
    input: UpdateGoalInput,
    status?: GoalStatus,
  ): Promise<GoalRow> {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.targetDate !== undefined) patch.target_date = input.targetDate;
    if (input.targetAmount !== undefined) patch.target_amount = input.targetAmount;
    if (status !== undefined) patch.status = status;

    const { data, error } = await supabaseAdmin
      .from(GOALS_TABLE)
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) throw error;
    return data as GoalRow;
  }

  async updateStatus(userId: string, id: string, status: GoalStatus): Promise<void> {
    const { error } = await supabaseAdmin
      .from(GOALS_TABLE)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw error;
  }

  async findRecurringLinksByGoalIds(goalIds: string[]): Promise<GoalRecurringPaymentRow[]> {
    if (goalIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(RECURRING_LINKS_TABLE)
      .select('*')
      .in('goal_id', goalIds);

    if (error) throw error;
    return (data ?? []) as GoalRecurringPaymentRow[];
  }

  async findTransactionLinksByGoalIds(goalIds: string[]): Promise<GoalTransactionRow[]> {
    if (goalIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(TRANSACTION_LINKS_TABLE)
      .select('*')
      .in('goal_id', goalIds);

    if (error) throw error;
    return (data ?? []) as GoalTransactionRow[];
  }

  /** Recurring payment IDs already linked to this user's goals (optionally excluding one goal). */
  async findLinkedRecurringPaymentIds(
    userId: string,
    excludeGoalId?: string,
  ): Promise<string[]> {
    const goals = await this.findAllByUser(userId);
    const goalIds = goals
      .map((goal) => goal.id)
      .filter((id) => id !== excludeGoalId);
    if (goalIds.length === 0) return [];

    const links = await this.findRecurringLinksByGoalIds(goalIds);
    return links.map((link) => link.recurring_payment_id);
  }

  /** Transaction IDs already linked to this user's goals (optionally excluding one goal). */
  async findLinkedTransactionIds(
    userId: string,
    excludeGoalId?: string,
  ): Promise<string[]> {
    const goals = await this.findAllByUser(userId);
    const goalIds = goals
      .map((goal) => goal.id)
      .filter((id) => id !== excludeGoalId);
    if (goalIds.length === 0) return [];

    const links = await this.findTransactionLinksByGoalIds(goalIds);
    return links.map((link) => link.transaction_id);
  }

  async replaceRecurringLinks(goalId: string, recurringPaymentIds: string[]): Promise<void> {
    const { error: deleteError } = await supabaseAdmin
      .from(RECURRING_LINKS_TABLE)
      .delete()
      .eq('goal_id', goalId);

    if (deleteError) throw deleteError;

    if (recurringPaymentIds.length === 0) return;

    const rows = recurringPaymentIds.map((recurringPaymentId) => ({
      goal_id: goalId,
      recurring_payment_id: recurringPaymentId,
    }));

    const { error: insertError } = await supabaseAdmin.from(RECURRING_LINKS_TABLE).insert(rows);
    if (insertError) throw insertError;
  }

  async replaceTransactionLinks(goalId: string, transactionIds: string[]): Promise<void> {
    const { error: deleteError } = await supabaseAdmin
      .from(TRANSACTION_LINKS_TABLE)
      .delete()
      .eq('goal_id', goalId);

    if (deleteError) throw deleteError;

    if (transactionIds.length === 0) return;

    const rows = transactionIds.map((transactionId) => ({
      goal_id: goalId,
      transaction_id: transactionId,
    }));

    const { error: insertError } = await supabaseAdmin.from(TRANSACTION_LINKS_TABLE).insert(rows);
    if (insertError) throw insertError;
  }
}

export const goalsRepository = new GoalsRepository();
