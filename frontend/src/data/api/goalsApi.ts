import { httpClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateGoalInput,
  GoalsPoolMetrics,
  SavingsGoal,
  UpdateGoalInput,
} from '../models/goals/types/goalTypes';

export const goalsApi = {
  list() {
    return httpClient<ApiResult<{ goals: SavingsGoal[]; metrics: GoalsPoolMetrics }>>('/goals');
  },

  create(input: CreateGoalInput) {
    return httpClient<ApiResult<{ goal: SavingsGoal }>>('/goals', {
      method: 'POST',
      body: input,
    });
  },

  update(id: string, input: UpdateGoalInput) {
    return httpClient<ApiResult<{ goal: SavingsGoal }>>(`/goals/${id}`, {
      method: 'PATCH',
      body: input,
    });
  },
};
