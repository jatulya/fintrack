export interface CategoryBucketSummary {
  amount: number;
  changePercent: number;
}

export interface DashboardSummary {
  savings: CategoryBucketSummary;
  investments: CategoryBucketSummary;
  savingsRate: number;
}
