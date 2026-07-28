import { transactionsRepository } from '../transactions/transactions.repository.js';
import type {
  AggregationTransaction,
  CategoryBucketSummary,
  DashboardSummary,
} from './dashboard.types.js';

type Bucket = 'savings' | 'investments';

function monthKey(date: Date): string {
  return date.toISOString().substring(0, 7);
}

function previousMonthKey(from: Date = new Date()): string {
  const previous = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - 1, 1));
  return monthKey(previous);
}

function categoryText(tx: AggregationTransaction): string {
  const label = tx.categories?.label ?? '';
  const name = tx.categories?.name ?? '';
  return `${label} ${name}`.toLowerCase();
}

function matchesBucket(tx: AggregationTransaction, bucket: Bucket): boolean {
  const text = categoryText(tx);
  if (bucket === 'savings') {
    return /\bsavings?\b/.test(text);
  }
  return /\binvestments?\b/.test(text);
}

/** Contributions into a bucket: spent adds, received (withdrawals) subtract. */
function contribution(tx: AggregationTransaction): number {
  const amount = Number(tx.amount);
  return tx.direction === 'spent' ? amount : -amount;
}

function sumContributions(
  transactions: AggregationTransaction[],
  bucket: Bucket,
  month?: string,
): number {
  return transactions.reduce((total, tx) => {
    if (!matchesBucket(tx, bucket)) {
      return total;
    }
    if (month && !tx.spent_at.startsWith(month)) {
      return total;
    }
    return total + contribution(tx);
  }, 0);
}

function changePercent(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function bucketSummary(
  transactions: AggregationTransaction[],
  bucket: Bucket,
  currentMonth: string,
  previousMonth: string,
): CategoryBucketSummary {
  const amount = Math.max(0, sumContributions(transactions, bucket));
  const currentMonthAmount = sumContributions(transactions, bucket, currentMonth);
  const previousMonthAmount = sumContributions(transactions, bucket, previousMonth);

  return {
    amount: Math.round(amount * 100) / 100,
    changePercent: changePercent(currentMonthAmount, previousMonthAmount),
  };
}

function calculateSavingsRate(
  transactions: AggregationTransaction[],
  currentMonth: string,
): number {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (!tx.spent_at.startsWith(currentMonth)) {
      continue;
    }

    const amount = Number(tx.amount);
    if (tx.direction === 'received') {
      income += amount;
    } else {
      expense += amount;
    }
  }

  if (income <= 0) {
    return 0;
  }

  return Math.round(((income - expense) / income) * 100);
}

export class DashboardService {
  constructor(private readonly transactions = transactionsRepository) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const rows = await this.transactions.findAllWithCategoryForUser(userId);
    const transactions: AggregationTransaction[] = rows.map((row) => ({
      amount: Number(row.amount),
      spent_at: row.spent_at,
      direction: row.direction,
      categories: row.categories,
    }));

    const now = new Date();
    const currentMonth = monthKey(now);
    const previousMonth = previousMonthKey(now);

    return {
      savings: bucketSummary(transactions, 'savings', currentMonth, previousMonth),
      investments: bucketSummary(transactions, 'investments', currentMonth, previousMonth),
      savingsRate: calculateSavingsRate(transactions, currentMonth),
    };
  }
}

export const dashboardService = new DashboardService();
