export interface AssetAllocationItem {
  id: string;
  name: string;
  amount: number;
  percent: number;
}

export const DEMO_ASSET_ALLOCATION: AssetAllocationItem[] = [
  { id: 'savings', name: 'Savings Account', amount: 50_000, percent: 30 },
  { id: 'liquid-mf', name: 'Liquid Mutual Funds', amount: 85_000, percent: 51.5 },
  { id: 'fd', name: 'Fixed Deposits', amount: 30_000, percent: 18.5 },
];

export interface TrajectoryPoint {
  label: string;
  actual: number | null;
  projected: number | null;
}

/** Past 6 months of nest-egg growth + short projected runway to fill the pool. */
export const DEMO_TRAJECTORY: TrajectoryPoint[] = [
  { label: 'Mar', actual: 95_000, projected: null },
  { label: 'Apr', actual: 110_000, projected: null },
  { label: 'May', actual: 125_000, projected: null },
  { label: 'Jun', actual: 140_000, projected: null },
  { label: 'Jul', actual: 152_000, projected: null },
  { label: 'Aug', actual: 165_000, projected: 165_000 },
  { label: 'Sep', actual: null, projected: 185_000 },
  { label: 'Oct', actual: null, projected: 205_000 },
  { label: 'Nov', actual: null, projected: 225_000 },
  { label: 'Dec', actual: null, projected: 245_000 },
];

export const DEMO_PROJECTED_COMPLETION = 'March 2028';
