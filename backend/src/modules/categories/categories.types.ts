export interface CategoryRow {
  id: string;
  user_id: string;
  label: string;
  name: string;
  icon: string | null;
  color: string | null;
  monthly_budget: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PublicCategory {
  id: string;
  label: string;
  name: string;
  icon: string | null;
  color: string | null;
  monthlyBudget: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  label: string;
  name: string;
  icon?: string;
  color?: string;
  monthlyBudget?: number | null;
}

export interface UpdateCategoryInput {
  label?: string;
  name?: string;
  icon?: string | null;
  color?: string | null;
  monthlyBudget?: number | null;
}
