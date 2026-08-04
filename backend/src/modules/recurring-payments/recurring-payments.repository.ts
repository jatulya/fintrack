import { supabaseAdmin } from "../../config/supabase.js";
import type {
  CreateRecurringPaymentInput,
  RecurringPaymentRow,
  RecurringPaymentWithRelations,
  UpdateRecurringPaymentInput,
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

  async findById(
    userId: string,
    id: string,
  ): Promise<RecurringPaymentWithRelations | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*, categories(name, label), accounts(name)")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;
    return data as RecurringPaymentWithRelations | null;
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

  async update(
    userId: string,
    id: string,
    input: UpdateRecurringPaymentInput & { nextPaymentDate?: string },
  ): Promise<RecurringPaymentWithRelations> {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.accountId !== undefined) patch.account_id = input.accountId;
    if (input.categoryId !== undefined) patch.category_id = input.categoryId;
    if (input.amount !== undefined) patch.amount = input.amount;
    if (input.direction !== undefined) patch.direction = input.direction;
    if (input.frequency !== undefined) patch.frequency = input.frequency;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.affectsBalance !== undefined) patch.affects_balance = input.affectsBalance;
    if (input.isActive !== undefined) patch.is_active = input.isActive;
    if (input.nextPaymentDate !== undefined) patch.next_payment_date = input.nextPaymentDate;

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select("*, categories(name, label), accounts(name)")
      .single();

    if (error) throw error;
    return data as RecurringPaymentWithRelations;
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

  async softDelete(userId: string, id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw error;
  }
}

export const recurringPaymentsRepository = new RecurringPaymentsRepository();
