import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateRecurringPaymentInput,
  RecurringPayment,
} from '../models/recurring/types/recurringTypes';

export const recurringPaymentsApi = {
  list() {
    return httpClient<ApiResult<{ recurringPayments: RecurringPayment[] }>>('/recurring-payments');
  },

  create(input: CreateRecurringPaymentInput) {
    return httpClient<ApiResult<{ recurringPayment: RecurringPayment }>>('/recurring-payments', {
      method: 'POST',
      body: input,
    });
  },
};
