import { supabaseAdmin } from "../../config/supabase.js";
import type {
  CreateRecurringPaymentInput,
  RecurringPaymentRow,
  RecurringPaymentWithRelations,
} from "./recurring-payments.types.js";

const TABLE = "recurring_payments";

export class RecurringPaymentsRepository {
  async findAllByUser(
    userId: string,
  ): Promise<RecurringPaymentWithRelations[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*, categories(name, label), accounts(name)")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("next_payment_date", { ascending: true });

    if (error) throw error;
    return (data ?? []) as RecurringPaymentWithRelations[];
  }

  async findByIds(userId: string, ids: string[]): Promise<RecurringPaymentRow[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .in("id", ids);

    if (error) throw error;
    return (data ?? []) as RecurringPaymentRow[];
  }

  async create(
    userId: string,
    input: CreateRecurringPaymentInput,
    nextPaymentDate: string,
  ): Promise<RecurringPaymentRow> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        user_id: userId,
        account_id: input.accountId,
        category_id: input.categoryId,
        amount: input.amount,
        direction: input.direction,
        frequency: input.frequency,
        start_date: input.startDate,
        next_payment_date: nextPaymentDate,
        notes: input.notes ?? "",
        affects_balance: input.affectsBalance ?? true,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as RecurringPaymentRow;
  }

  async updateNextPaymentDate(
    userId: string,
    id: string,
    nextPaymentDate: string,
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({
        next_payment_date: nextPaymentDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw error;
  }
}

export const recurringPaymentsRepository = new RecurringPaymentsRepository();
