import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type { Account, CreateAccountInput } from '../models/accounts/types/accountTypes';

export const accountsApi = {
  list() {
    return httpClient<ApiResult<{ accounts: Account[] }>>('/accounts');
  },

  create(input: CreateAccountInput) {
    return httpClient<ApiResult<{ account: Account }>>('/accounts', {
      method: 'POST',
      body: input,
    });
  },
};
