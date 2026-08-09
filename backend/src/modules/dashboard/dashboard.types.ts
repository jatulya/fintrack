export interface CategoryBucketSummary {
  amount: number;
  changePercent: number;
}

export interface DashboardSummary {
  savings: CategoryBucketSummary;
  investments: CategoryBucketSummary;
  savingsRate: number;
}

export interface AggregationTransaction {
  amount: number;
  spent_at: string;
  direction: 'received' | 'spent';
  categories: {
    name: string;
    label: string;
  } | null;
}
