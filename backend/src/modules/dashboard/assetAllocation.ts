import type { AggregationTransaction, AssetAllocationItem } from './dashboard.types.js';

export type CategoryBucket = 'savings' | 'investments';

export type AssetSliceId =
  | 'savings-account'
  | 'fd'
  | 'rd'
  | 'mutual-fund'
  | 'stocks'
  | 'other-investments';

const ASSET_SLICE_META: Record<AssetSliceId, { name: string; order: number }> = {
  'savings-account': { name: 'Savings Account', order: 1 },
  fd: { name: 'Fixed Deposits', order: 2 },
  rd: { name: 'Recurring Deposits', order: 3 },
  'mutual-fund': { name: 'Mutual Funds', order: 4 },
  stocks: { name: 'Stocks', order: 5 },
  'other-investments': { name: 'Other Investments', order: 6 },
};

/** Theme label only — ignore description so "investment" in the name cannot steal savings. */
function categoryLabel(tx: AggregationTransaction): string {
  return (tx.categories?.label ?? '').trim().toLowerCase();
}

export function isSavingsCategory(tx: AggregationTransaction): boolean {
  return /\bsavings?\b/.test(categoryLabel(tx));
}

export function isInvestmentCategory(tx: AggregationTransaction): boolean {
  return /\binvestments?\b/.test(categoryLabel(tx));
}

export function matchesCategoryBucket(
  tx: AggregationTransaction,
  bucket: CategoryBucket,
): boolean {
  if (bucket === 'savings') {
    return isSavingsCategory(tx) && !isInvestmentCategory(tx);
  }
  return isInvestmentCategory(tx);
}

function notesText(tx: AggregationTransaction): string {
  return (tx.notes ?? '').toLowerCase();
}

/**
 * Classify a transaction into an asset-allocation slice.
 * Rules (category = theme label):
 * - Savings + FD note → Fixed Deposits
 * - Savings + RD note → Recurring Deposits
 * - Savings (else) → Savings Account
 * - Investment + MF note → Mutual Funds
 * - Investment + Stocks note → Stocks
 * - Investment (else) → Other Investments
 */
export function classifyAssetSlice(tx: AggregationTransaction): AssetSliceId | null {
  const notes = notesText(tx);
  const savings = matchesCategoryBucket(tx, 'savings');
  const investment = matchesCategoryBucket(tx, 'investments');

  if (savings) {
    if (/\bfd\b/.test(notes)) return 'fd';
    if (/\brd\b/.test(notes)) return 'rd';
    return 'savings-account';
  }

  if (investment) {
    // "MF " / MF as a token in notes
    if (/\bmf\b/.test(notes) || notes.includes('mf ')) return 'mutual-fund';
    if (/\bstocks?\b/.test(notes)) return 'stocks';
    return 'other-investments';
  }

  return null;
}

export function buildAssetAllocation(
  transactions: AggregationTransaction[],
): AssetAllocationItem[] {
  const totals: Record<AssetSliceId, number> = {
    'savings-account': 0,
    fd: 0,
    rd: 0,
    'mutual-fund': 0,
    stocks: 0,
    'other-investments': 0,
  };

  for (const tx of transactions) {
    const slice = classifyAssetSlice(tx);
    if (!slice) continue;
    totals[slice] += Number(tx.amount);
  }

  const entries = (Object.keys(totals) as AssetSliceId[])
    .map((id) => ({
      id,
      name: ASSET_SLICE_META[id].name,
      amount: Math.round(totals[id] * 100) / 100,
      order: ASSET_SLICE_META[id].order,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => a.order - b.order);

  const poolTotal = entries.reduce((sum, item) => sum + item.amount, 0);

  return entries.map(({ id, name, amount }) => ({
    id,
    name,
    amount,
    percent: poolTotal > 0 ? Math.round((amount / poolTotal) * 1000) / 10 : 0,
  }));
}
