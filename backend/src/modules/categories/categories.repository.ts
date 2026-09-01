import { supabaseAdmin } from '../../config/supabase.js';
import type { CategoryRow, CreateCategoryInput, UpdateCategoryInput } from './categories.types.js';

const TABLE = 'categories';

export class CategoriesRepository {
  async findAllByUser(userId: string): Promise<CategoryRow[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('label', { ascending: true });

    if (error) throw error;
    return (data ?? []) as CategoryRow[];
  }

  async findById(userId: string, id: string): Promise<CategoryRow | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as CategoryRow | null;
  }

  async create(userId: string, input: CreateCategoryInput): Promise<CategoryRow> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        user_id: userId,
        label: input.label,
        name: input.name,
        icon: input.icon ?? null,
        color: input.color ?? null,
        monthly_budget:
          input.monthlyBudget === undefined || input.monthlyBudget === null
            ? null
            : Number(input.monthlyBudget),
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as CategoryRow;
  }

  async update(userId: string, id: string, input: UpdateCategoryInput): Promise<CategoryRow> {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.label !== undefined) patch.label = input.label;
    if (input.name !== undefined) patch.name = input.name;
    if (input.icon !== undefined) patch.icon = input.icon;
    if (input.color !== undefined) patch.color = input.color;
    if (input.monthlyBudget !== undefined) {
      patch.monthly_budget =
        input.monthlyBudget === null ? null : Number(input.monthlyBudget);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) throw error;
    return data as CategoryRow;
  }
}

export const categoriesRepository = new CategoriesRepository();
