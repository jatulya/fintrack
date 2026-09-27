export interface Category {
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
