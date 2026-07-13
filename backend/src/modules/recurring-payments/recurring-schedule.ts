import type { RecurringPaymentFrequency } from './recurring-payments.types.js';

const MAX_BACKFILL_OCCURRENCES = 520;

/** Parse YYYY-MM-DD as a UTC calendar date (avoids local TZ shifting the day). */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateOnly(): string {
  return formatDateOnly(new Date());
}

export function addFrequency(date: Date, frequency: RecurringPaymentFrequency): Date {
  const next = new Date(date.getTime());
  switch (frequency) {
    case 'weekly':
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case 'monthly':
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
    case 'yearly':
      next.setUTCFullYear(next.getUTCFullYear() + 1);
      break;
  }
  return next;
}

export interface RecurringScheduleResult {
  /** Occurrence dates on or before today (inclusive) to create as transactions. */
  pastDates: string[];
  /** First occurrence strictly after today. */
  nextPaymentDate: string;
}

/**
 * Builds the schedule for a recurring payment.
 * - Past/today dates become transactions.
 * - nextPaymentDate is the first date after today.
 * - If startDate is in the future, no past dates; nextPaymentDate = startDate.
 */
export function buildRecurringSchedule(
  startDate: string,
  frequency: RecurringPaymentFrequency,
  today: string = todayDateOnly(),
): RecurringScheduleResult {
  const todayDate = parseDateOnly(today);
  let cursor = parseDateOnly(startDate);

  if (cursor > todayDate) {
    return { pastDates: [], nextPaymentDate: startDate };
  }

  const pastDates: string[] = [];
  while (cursor <= todayDate && pastDates.length < MAX_BACKFILL_OCCURRENCES) {
    pastDates.push(formatDateOnly(cursor));
    cursor = addFrequency(cursor, frequency);
  }

  return {
    pastDates,
    nextPaymentDate: formatDateOnly(cursor),
  };
}
