export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

export interface SavingsPoolMetrics {
  totalCollected: number;
  totalTarget: number;
  amountToCollect: number;
  overallRate: number;
}
