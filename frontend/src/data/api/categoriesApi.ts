import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type { Category, CreateCategoryInput } from '../models/categories/types/categoryTypes';

export const categoriesApi = {
  list() {
    return httpClient<ApiResult<{ categories: Category[] }>>('/categories');
  },

  create(input: CreateCategoryInput) {
    return httpClient<ApiResult<{ category: Category }>>('/categories', {
      method: 'POST',
      body: input,
    });
  },
};
