import * as XLSX from 'xlsx';
import type { ParsedImportRow } from './transaction-import.types.js';
import { ValidationError } from '../../utils/errors.js';

const HEADER_ALIASES: Record<string, string[]> = {
  account_name: ['account_name', 'account', 'accountname'],
  category_label: ['category_label', 'category', 'categorylabel', 'category_name', 'categoryname'],
  amount: ['amount', 'value'],
  date: ['date', 'spent_at', 'spentat', 'transaction_date'],
  direction: ['direction', 'type', 'transaction_type'],
  notes: ['notes', 'note', 'description', 'memo'],
  affects_balance: ['affects_balance', 'affectsbalance', 'update_balance', 'update_account_balance'],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '_');
}

function resolveField(normalizedRow: Record<string, unknown>, field: keyof typeof HEADER_ALIASES): unknown {
  for (const alias of HEADER_ALIASES[field]) {
    if (alias in normalizedRow) return normalizedRow[alias];
  }
  return undefined;
}

function parseDirection(value: unknown): 'received' | 'spent' {
  const raw = String(value ?? '').trim().toLowerCase();
  if (['received', 'income', 'in', 'credit', '+'].includes(raw)) return 'received';
  if (['spent', 'expense', 'out', 'debit', '-'].includes(raw)) return 'spent';
  throw new ValidationError(`Invalid direction "${value}". Use received or spent.`);
}

function parseAffectsBalance(value: unknown): boolean {
  if (value === undefined || value === null || String(value).trim() === '') return true;
  const raw = String(value).trim().toLowerCase();
  if (['yes', 'true', '1', 'y'].includes(raw)) return true;
  if (['no', 'false', '0', 'n'].includes(raw)) return false;
  throw new ValidationError(`Invalid affects balance value "${value}". Use yes or no.`);
}

function parseAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError(`Amount must be greater than zero (got "${value}").`);
  }
  return amount;
}

function formatDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function parseDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${formatDatePart(parsed.m)}-${formatDatePart(parsed.d)}`;
    }
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    throw new ValidationError('Date is required.');
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return raw;

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return `${year}-${formatDatePart(Number(month))}-${formatDatePart(Number(day))}`;
  }

  const parsedDate = new Date(raw);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().slice(0, 10);
  }

  throw new ValidationError(`Invalid date "${value}". Use YYYY-MM-DD.`);
}

function parseRow(normalizedRow: Record<string, unknown>, rowNumber: number): ParsedImportRow | null {
  const values = Object.values(normalizedRow);
  if (values.every((value) => value === undefined || value === null || String(value).trim() === '')) {
    return null;
  }

  const accountName = String(resolveField(normalizedRow, 'account_name') ?? '').trim();
  const categoryLabel = String(resolveField(normalizedRow, 'category_label') ?? '').trim();

  if (!accountName) throw new ValidationError('Account Name is required.');
  if (!categoryLabel) throw new ValidationError('Category Label is required.');

  return {
    rowNumber,
    accountName,
    categoryLabel,
    amount: parseAmount(resolveField(normalizedRow, 'amount')),
    spentAt: parseDate(resolveField(normalizedRow, 'date')),
    direction: parseDirection(resolveField(normalizedRow, 'direction')),
    notes: String(resolveField(normalizedRow, 'notes') ?? '').trim(),
    affectsBalance: parseAffectsBalance(resolveField(normalizedRow, 'affects_balance')),
  };
}

export function parseTransactionExcel(buffer: Buffer): ParsedImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new ValidationError('The Excel file has no sheets.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new ValidationError('The Excel file has no data rows.');
  }

  const parsedRows: ParsedImportRow[] = [];

  rawRows.forEach((rawRow, index) => {
    const normalizedRow = Object.fromEntries(
      Object.entries(rawRow).map(([key, value]) => [normalizeKey(key), value]),
    );

    const parsed = parseRow(normalizedRow, index + 2);
    if (parsed) parsedRows.push(parsed);
  });

  if (parsedRows.length === 0) {
    throw new ValidationError('No valid transaction rows were found in the file.');
  }

  return parsedRows;
}

export function buildImportTemplateBuffer(): Buffer {
  const rows = [
    {
      'Account Name': 'HDFC Savings',
      'Category Label': 'dining',
      Amount: 450,
      Date: '2026-06-11',
      Direction: 'spent',
      Notes: 'Lunch',
      'Affects Balance': 'yes',
    },
    {
      'Account Name': 'HDFC Savings',
      'Category Label': 'salary',
      Amount: 85000,
      Date: '2026-06-01',
      Direction: 'received',
      Notes: 'Monthly salary',
      'Affects Balance': 'yes',
    },
    {
      'Account Name': 'Cash Wallet',
      'Category Label': 'entertainment',
      Amount: 200,
      Date: '2026-06-05',
      Direction: 'spent',
      Notes: 'Tracked only, no balance change',
      'Affects Balance': 'no',
    },
  ];

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Transactions');
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}
