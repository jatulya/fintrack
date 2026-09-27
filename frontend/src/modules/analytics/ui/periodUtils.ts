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

export function filterTransactionsByCategoryLabels(
  transactions: Transaction[],
  selectedLabels: Set<string> | null,
): Transaction[] {
  if (selectedLabels === null) return transactions;
  if (selectedLabels.size === 0) return [];
  return transactions.filter((t) => selectedLabels.has(t.categoryLabel));
}

function includesCategoryLabel(
  selectedLabels: Set<string> | null | undefined,
  categoryLabel: string,
): boolean {
  if (selectedLabels === null || selectedLabels === undefined) return true;
  if (selectedLabels.size === 0) return false;
  return selectedLabels.has(categoryLabel);
}

export function sumSpentInMonth(
  transactions: Transaction[],
  monthKey: string,
  selectedLabels?: Set<string> | null,
): number {
  return transactions.reduce((sum, t) => {
    if (t.direction !== 'spent') return sum;
    if (!includesCategoryLabel(selectedLabels, t.categoryLabel)) return sum;
    const key = toMonthInputValue(parseSpentAt(t.spentAt));
    if (key !== monthKey) return sum;
    return sum + t.amount;
  }, 0);
}

export function sumSpentInRange(
  transactions: Transaction[],
  range: DateRange,
  selectedLabels?: Set<string> | null,
): number {
  return filterTransactionsByRange(transactions, range).reduce((sum, t) => {
    if (t.direction !== 'spent') return sum;
    if (!includesCategoryLabel(selectedLabels, t.categoryLabel)) return sum;
    return sum + t.amount;
  }, 0);
}

export interface SpendVsPriorPeriodResult {
  periodSpend: number;
  priorAverage: number;
  percent: number | null;
  periodSpendLabel: string;
  priorAverageLabel: string;
  comparisonContext: string;
}

function shiftPeriodSelection(selection: PeriodSelection, stepsBack: number): PeriodSelection {
  if (selection.preset === 'monthly') {
    const [yStr, mStr] = selection.monthValue.split('-');
    const date = new Date(Number(yStr), Number(mStr) - 1 - stepsBack, 1);
    return { ...selection, monthValue: toMonthInputValue(date) };
  }
  if (selection.preset === 'weekly') {
    return { ...selection, weekOffset: selection.weekOffset - stepsBack };
  }
  if (selection.preset === 'yearly') {
    return { ...selection, yearValue: selection.yearValue - stepsBack };
  }

  const range = resolvePeriodRange(selection);
  const msPerDay = 24 * 60 * 60 * 1000;
  const spanDays =
    Math.ceil((range.end.getTime() - range.start.getTime()) / msPerDay) + 1;
  const priorEnd = addDays(range.start, -1 - (stepsBack - 1) * spanDays);
  const priorStart = addDays(priorEnd, -(spanDays - 1));
  return {
    ...selection,
    customStart: toDateInputValue(priorStart),
    customEnd: toDateInputValue(priorEnd),
  };
}

function spendInsightLabels(selection: PeriodSelection, range: DateRange): {
  periodSpendLabel: string;
  priorAverageLabel: string;
  comparisonContext: string;
} {
  if (selection.preset === 'monthly') {
    const monthLabel = range.start.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    return {
      periodSpendLabel: `Spent in ${monthLabel}`,
      priorAverageLabel: 'Avg of prior 4 months',
      comparisonContext: `in ${monthLabel} compared to the last 4 months`,
    };
  }
  if (selection.preset === 'weekly') {
    const weekLabel = formatPeriodDisplayLabel(selection, range);
    return {
      periodSpendLabel: `Spent (${weekLabel})`,
      priorAverageLabel: 'Avg of prior 4 weeks',
      comparisonContext: `in ${weekLabel} compared to the last 4 weeks`,
    };
  }
  if (selection.preset === 'yearly') {
    return {
      periodSpendLabel: `Spent in ${selection.yearValue}`,
      priorAverageLabel: 'Avg of prior 4 years',
      comparisonContext: `in ${selection.yearValue} compared to the last 4 years`,
    };
  }
  return {
    periodSpendLabel: `Spent (${formatPeriodDisplayLabel(selection, range)})`,
    priorAverageLabel: 'Avg of prior 4 periods',
    comparisonContext: `in this period compared to the last 4 similar periods`,
  };
}

/** Selected period spend vs average of the prior 4 comparable periods. */
export function buildSpendVsPriorPeriod(
  transactions: Transaction[],
  selection: PeriodSelection,
  selectedLabels?: Set<string> | null,
  now = new Date(),
): SpendVsPriorPeriodResult {
  const focusRange = resolvePeriodRange(selection, now);
  const periodSpend = sumSpentInRange(transactions, focusRange, selectedLabels);
  const labels = spendInsightLabels(selection, focusRange);

  let priorTotal = 0;
  for (let i = 1; i <= 4; i += 1) {
    const priorSelection = shiftPeriodSelection(selection, i);
    const priorRange = resolvePeriodRange(priorSelection, now);
    priorTotal += sumSpentInRange(transactions, priorRange, selectedLabels);
  }
  const priorAverage = priorTotal / 4;

  let percent: number | null = null;
  if (priorAverage > 0) {
    percent = Math.round((periodSpend / priorAverage) * 100);
  } else if (periodSpend > 0) {
    percent = null;
  } else {
    percent = 0;
  }

  return {
    periodSpend,
    priorAverage,
    percent,
    ...labels,
  };
}

export interface SpendVsPriorMonthsResult {
  thisMonth: number;
  priorAverage: number;
  percent: number | null;
}

/** @deprecated Use buildSpendVsPriorPeriod */
export function buildSpendVsPriorMonths(
  transactions: Transaction[],
  selectedLabels?: Set<string> | null,
  now = new Date(),
): SpendVsPriorMonthsResult {
  const selection = createDefaultPeriodSelection(now);
  const result = buildSpendVsPriorPeriod(transactions, selection, selectedLabels, now);
  return {
    thisMonth: result.periodSpend,
    priorAverage: result.priorAverage,
    percent: result.percent,
  };
}

export function countCategoriesOverBudget(
  categories: Array<{ label: string; monthlyBudget: number | null }>,
  transactions: Transaction[],
  selectedLabels?: Set<string> | null,
  selection: PeriodSelection = createDefaultPeriodSelection(),
  now = new Date(),
): number {
  const focusRange = resolvePeriodRange(selection, now);
  let count = 0;
  for (const category of categories) {
    if (category.monthlyBudget === null || category.monthlyBudget === undefined) continue;
    if (!includesCategoryLabel(selectedLabels, category.label)) continue;
    const spent = sumSpentInRange(
      transactions.filter((t) => t.categoryLabel === category.label),
      focusRange,
    );
    if (spent > category.monthlyBudget) count += 1;
  }
  return count;
}
