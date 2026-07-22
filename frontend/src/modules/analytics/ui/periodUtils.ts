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

export interface PeriodSelection {
  preset: PeriodPreset;
  /** YYYY-MM for monthly (`type="month"`) */
  monthValue: string;
  /** Selected calendar year for yearly */
  yearValue: number;
  /** 0 = current week, negative = past weeks */
  weekOffset: number;
  customStart: string;
  customEnd: string;
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

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toMonthInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Monday start of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function clampRangeToToday(range: DateRange, now = new Date()): DateRange {
  const todayEnd = endOfDay(now);
  const todayStart = startOfDay(now);
  let { start, end } = range;

  if (end > todayEnd) end = todayEnd;
  if (start > todayEnd) {
    start = todayStart;
    end = todayEnd;
  }
  if (start > end) start = startOfDay(end);
  return { start, end };
}

export function createDefaultPeriodSelection(now = new Date()): PeriodSelection {
  return {
    preset: 'monthly',
    monthValue: toMonthInputValue(now),
    yearValue: now.getFullYear(),
    weekOffset: 0,
    customStart: toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    customEnd: toDateInputValue(now),
  };
}

export function resolvePeriodRange(selection: PeriodSelection, now = new Date()): DateRange {
  const { preset, monthValue, yearValue, weekOffset, customStart, customEnd } = selection;

  let range: DateRange;

  if (preset === 'weekly') {
    const currentWeekStart = startOfWeek(now);
    const weekStart = addDays(currentWeekStart, weekOffset * 7);
    const weekEnd = endOfDay(addDays(weekStart, 6));
    range = { start: weekStart, end: weekEnd };
  } else if (preset === 'yearly') {
    const year = yearValue;
    range = {
      start: startOfDay(new Date(year, 0, 1)),
      end: endOfDay(new Date(year, 11, 31)),
    };
  } else if (preset === 'custom') {
    const today = toDateInputValue(now);
    const startStr = customStart || today;
    const endStr = customEnd || today;
    const start = startOfDay(parseSpentAt(startStr));
    const end = endOfDay(parseSpentAt(endStr));
    range = start <= end ? { start, end } : { start: end, end: start };
  } else {
    // monthly
    const [yStr, mStr] = (monthValue || toMonthInputValue(now)).split('-');
    const year = Number(yStr);
    const monthIndex = Number(mStr) - 1;
    range = {
      start: startOfDay(new Date(year, monthIndex, 1)),
      end: endOfDay(new Date(year, monthIndex + 1, 0)),
    };
  }

  return clampRangeToToday(range, now);
}

export function canGoToNextWeek(weekOffset: number): boolean {
  return weekOffset < 0;
}

export function isCurrentWeek(weekOffset: number): boolean {
  return weekOffset === 0;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function formatDayOrdinal(date: Date): string {
  return ordinal(date.getDate());
}

export function formatPeriodDisplayLabel(
  selection: PeriodSelection,
  range: DateRange,
  now = new Date(),
): string {
  const { preset, customStart, customEnd } = selection;

  if (preset === 'monthly') {
    return range.start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  if (preset === 'yearly') {
    return String(selection.yearValue);
  }

  if (preset === 'custom') {
    const from = customStart || toDateInputValue(range.start);
    const to = customEnd || toDateInputValue(range.end);
    return `Custom - ${from} to ${to}`;
  }

  // weekly: show nominal week window, but clamp display end to today if future
  const weekStart = startOfDay(range.start);
  const nominalEnd = addDays(weekStart, 6);
  const displayEnd = nominalEnd > startOfDay(now) ? startOfDay(now) : nominalEnd;
  return `Weekly ${formatDayOrdinal(weekStart)} - ${formatDayOrdinal(displayEnd)}`;
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

function iterateDays(range: DateRange, now = new Date()): Date[] {
  const days: Date[] = [];
  const cursor = startOfDay(range.start);
  const last = startOfDay(range.end);
  const today = startOfDay(now);
  const cappedLast = last > today ? today : last;
  while (cursor <= cappedLast) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function iterateMonths(range: DateRange, now = new Date()): Date[] {
  const months: Date[] = [];
  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  const last = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const cappedLast = last > currentMonth ? currentMonth : last;
  while (cursor <= cappedLast) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export function buildExpenseSeries(
  transactions: Transaction[],
  range: DateRange,
  granularity: BucketGranularity = getBucketGranularity(range),
  now = new Date(),
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
    return iterateMonths(range, now).map((date) => {
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
  return iterateDays(range, now).map((date) => {
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
  now = new Date(),
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
    return iterateMonths(range, now).map((date) => {
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
  return iterateDays(range, now).map((date) => {
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

export function maxMonthInputValue(now = new Date()): string {
  return toMonthInputValue(now);
}

export function maxYearValue(now = new Date()): number {
  return now.getFullYear();
}
