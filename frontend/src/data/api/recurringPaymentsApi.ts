import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateRecurringPaymentInput,
  ProcessRecurringPaymentsResult,
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

  remove(id: string) {
    return httpClient<ApiResult<{ message: string }>>(`/recurring-payments/${id}`, {
      method: 'DELETE',
    });
  },

  processDue() {
    return httpClient<ApiResult<ProcessRecurringPaymentsResult>>('/recurring-payments/process-due', {
      method: 'POST',
    });
  },

  dueCount() {
    return httpClient<ApiResult<{ dueCount: number }>>('/recurring-payments/due-count');
  },
};
