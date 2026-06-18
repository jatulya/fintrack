import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateTransactionInput,
  ListTransactionsParams,
  PaginatedTransactionList,
  Transaction,
} from '../models/transactions/types/transactionTypes';

function buildQueryString(params: ListTransactionsParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.direction) searchParams.set('direction', params.direction);
  if (params.accountId) searchParams.set('accountId', params.accountId);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const transactionsApi = {
  list(params: ListTransactionsParams = {}) {
    return httpClient<ApiResult<PaginatedTransactionList>>(`/transactions${buildQueryString(params)}`);
  },

  create(input: CreateTransactionInput) {
    return httpClient<ApiResult<{ transaction: Transaction }>>('/transactions', {
      method: 'POST',
      body: input,
    });
  },

  remove(id: string) {
    return httpClient<ApiResult<{ message: string }>>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};
