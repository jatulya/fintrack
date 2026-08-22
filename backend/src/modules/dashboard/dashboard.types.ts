export interface CategoryBucketSummary {
  amount: number;
  changePercent: number;
}

export interface AssetAllocationItem {
  id: string;
  name: string;
  amount: number;
  percent: number;
}

export interface DashboardSummary {
  savings: CategoryBucketSummary;
  investments: CategoryBucketSummary;
  savingsRate: number;
  assetAllocation: AssetAllocationItem[];
}

export interface AggregationTransaction {
  amount: number;
  spent_at: string;
  direction: 'received' | 'spent';
  notes: string;
  categories: {
    name: string;
    label: string;
  } | null;
}
