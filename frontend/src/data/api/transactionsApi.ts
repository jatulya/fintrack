import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type { CreateTransactionInput, Transaction } from '../models/transactions/types/transactionTypes';

export const transactionsApi = {
  list() {
    return httpClient<ApiResult<{ transactions: Transaction[] }>>('/transactions');
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
