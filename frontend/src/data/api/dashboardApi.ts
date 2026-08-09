import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type { DashboardSummary } from '../models/dashboard/types/dashboardTypes';

export const dashboardApi = {
  getSummary() {
    return httpClient<ApiResult<{ summary: DashboardSummary }>>('/dashboard/summary');
  },
};
