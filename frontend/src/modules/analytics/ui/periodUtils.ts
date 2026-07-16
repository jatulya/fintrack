import type { Transaction } from '../../../data/models/transactions/types/transactionTypes';

export type PeriodPreset = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type BucketGranularity = 'day' | 'month';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ExpenseBucket {
  key: string;
  label: string;
  date: Date;
  expense: number;
}

export interface IncomeExpenseBucket {
  key: string;
  label: string;
  income: number;
  expense: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseSpentAt(spentAt: string): Date {
  return new Date(spentAt.includes('T') ? spentAt : `${spentAt}T00:00:00`);
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function resolvePeriodRange(
  preset: PeriodPreset,
  customStart?: string,
  customEnd?: string,
  now = new Date(),
): DateRange {
  if (preset === 'weekly') {
    const end = endOfDay(now);
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return { start, end };
  }

  if (preset === 'yearly') {
    return {
      start: startOfDay(new Date(now.getFullYear(), 0, 1)),
      end: endOfDay(new Date(now.getFullYear(), 11, 31)),
    };
  }

  if (preset === 'custom') {
    const today = toDateInputValue(now);
    const startStr = customStart || today;
    const endStr = customEnd || today;
    const start = startOfDay(parseSpentAt(startStr));
    const end = endOfDay(parseSpentAt(endStr));
    return start <= end ? { start, end } : { start: end, end: start };
  }

  // monthly (default): current calendar month
  return {
    start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

export function getBucketGranularity(range: DateRange): BucketGranularity {
  const msPerDay = 24 * 60 * 60 * 1000;
  const spanDays = Math.ceil((range.end.getTime() - range.start.getTime()) / msPerDay) + 1;
  return spanDays <= 62 ? 'day' : 'month';
}

export function filterTransactionsByRange(
  transactions: Transaction[],
  range: DateRange,
): Transaction[] {
  return transactions.filter((t) => {
    const d = parseSpentAt(t.spentAt);
    return d >= range.start && d <= range.end;
  });
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function dayKey(date: Date): string {
  return toDateInputValue(date);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function iterateDays(range: DateRange): Date[] {
  const days: Date[] = [];
  const cursor = startOfDay(range.start);
  const last = startOfDay(range.end);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function iterateMonths(range: DateRange): Date[] {
  const months: Date[] = [];
  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  const last = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
  while (cursor <= last) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export function buildExpenseSeries(
  transactions: Transaction[],
  range: DateRange,
  granularity: BucketGranularity = getBucketGranularity(range),
): ExpenseBucket[] {
  const expenses = filterTransactionsByRange(transactions, range).filter(
    (t) => t.direction === 'spent',
  );

  if (granularity === 'month') {
    const map = new Map<string, number>();
    for (const t of expenses) {
      const d = parseSpentAt(t.spentAt);
      const key = monthKey(d);
      map.set(key, (map.get(key) || 0) + t.amount);
    }
    return iterateMonths(range).map((date) => {
      const key = monthKey(date);
      return {
        key,
        label: formatMonthLabel(date),
        date,
        expense: map.get(key) || 0,
      };
    });
  }

  const map = new Map<string, number>();
  for (const t of expenses) {
    const d = parseSpentAt(t.spentAt);
    const key = dayKey(d);
    map.set(key, (map.get(key) || 0) + t.amount);
  }
  return iterateDays(range).map((date) => {
    const key = dayKey(date);
    return {
      key,
      label: formatDayLabel(date),
      date,
      expense: map.get(key) || 0,
    };
  });
}

export function buildIncomeExpenseSeries(
  transactions: Transaction[],
  range: DateRange,
  granularity: BucketGranularity = getBucketGranularity(range),
): IncomeExpenseBucket[] {
  const inRange = filterTransactionsByRange(transactions, range);

  if (granularity === 'month') {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of inRange) {
      const key = monthKey(parseSpentAt(t.spentAt));
      const bucket = map.get(key) || { income: 0, expense: 0 };
      if (t.direction === 'received') bucket.income += t.amount;
      if (t.direction === 'spent') bucket.expense += t.amount;
      map.set(key, bucket);
    }
    return iterateMonths(range).map((date) => {
      const key = monthKey(date);
      const bucket = map.get(key) || { income: 0, expense: 0 };
      return { key, label: formatMonthLabel(date), ...bucket };
    });
  }

  const map = new Map<string, { income: number; expense: number }>();
  for (const t of inRange) {
    const key = dayKey(parseSpentAt(t.spentAt));
    const bucket = map.get(key) || { income: 0, expense: 0 };
    if (t.direction === 'received') bucket.income += t.amount;
    if (t.direction === 'spent') bucket.expense += t.amount;
    map.set(key, bucket);
  }
  return iterateDays(range).map((date) => {
    const key = dayKey(date);
    const bucket = map.get(key) || { income: 0, expense: 0 };
    return { key, label: formatDayLabel(date), ...bucket };
  });
}

export function buildCategoryTotals(
  transactions: Transaction[],
  range: DateRange,
): { name: string; value: number }[] {
  const map = filterTransactionsByRange(transactions, range)
    .filter((t) => t.direction === 'spent')
    .reduce(
      (acc, t) => {
        acc[t.categoryLabel] = (acc[t.categoryLabel] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getExpenseTitle(preset: PeriodPreset): string {
  switch (preset) {
    case 'weekly':
      return 'Weekly Expenses';
    case 'yearly':
      return 'Yearly Expenses';
    case 'custom':
      return 'Expenses';
    default:
      return 'Monthly Expenses';
  }
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPeakLabel(date: Date, granularity: BucketGranularity): string {
  if (granularity === 'month') {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export { toDateInputValue };
