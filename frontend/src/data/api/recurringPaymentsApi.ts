import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateRecurringPaymentInput,
  RecurringPayment,
  UpdateRecurringPaymentInput,
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

  update(id: string, input: UpdateRecurringPaymentInput) {
    return httpClient<ApiResult<{ recurringPayment: RecurringPayment }>>(`/recurring-payments/${id}`, {
      method: 'PATCH',
      body: input,
    });
  },
};
