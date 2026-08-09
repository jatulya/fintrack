import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateRecurringPaymentInput,
  ProcessRecurringPaymentsResult,
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

  processDue() {
    return httpClient<ApiResult<ProcessRecurringPaymentsResult>>('/recurring-payments/process-due', {
      method: 'POST',
    });
  },

  dueCount() {
    return httpClient<ApiResult<{ dueCount: number }>>('/recurring-payments/due-count');
  },
};
