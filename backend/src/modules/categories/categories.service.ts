import { categoriesRepository } from './categories.repository.js';
import type {
  CategoryRow,
  CreateCategoryInput,
  PublicCategory,
  UpdateCategoryInput,
} from './categories.types.js';
import { NotFoundError } from '../../utils/errors.js';
import { errorMessages } from '../../common/texts/strings.js';

function toPublicCategory(row: CategoryRow): PublicCategory {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    icon: row.icon,
    color: row.color,
    monthlyBudget:
      row.monthly_budget === null || row.monthly_budget === undefined
        ? null
        : Number(row.monthly_budget),
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

  async update(userId: string, id: string, input: UpdateCategoryInput): Promise<PublicCategory> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) {
      throw new NotFoundError(errorMessages.financial.categoryNotFound);
    }

    const row = await this.repo.update(userId, id, input);
    return toPublicCategory(row);
  }
}

export const categoriesService = new CategoriesService();
