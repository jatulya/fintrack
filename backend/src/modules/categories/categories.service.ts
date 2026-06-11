import { categoriesRepository } from './categories.repository.js';
import type { CategoryRow, CreateCategoryInput, PublicCategory } from './categories.types.js';

function toPublicCategory(row: CategoryRow): PublicCategory {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CategoriesService {
  constructor(private readonly repo = categoriesRepository) {}

  async list(userId: string): Promise<PublicCategory[]> {
    const rows = await this.repo.findAllByUser(userId);
    return rows.map(toPublicCategory);
  }

  async create(userId: string, input: CreateCategoryInput): Promise<PublicCategory> {
    const row = await this.repo.create(userId, input);
    return toPublicCategory(row);
  }
}

export const categoriesService = new CategoriesService();
