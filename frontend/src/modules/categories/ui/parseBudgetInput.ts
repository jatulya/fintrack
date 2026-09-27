export function parseMonthlyBudgetInput(raw: string): number | null | 'invalid' {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  if (!/^\d+$/.test(trimmed)) return 'invalid';

  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value < 0) return 'invalid';
  return value;
}
