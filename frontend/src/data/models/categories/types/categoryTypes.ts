export interface Category {
  id: string;
  label: string;
  name: string;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  label: string;
  name: string;
  icon?: string;
  color?: string;
}
