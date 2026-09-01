import { paths } from '../../../common/routes/paths';
import type { PeriodSelection } from './periodUtils';
import { resolvePeriodRange, toDateInputValue } from './periodUtils';

const CATEGORIES_PARAM = 'categories';

export function parseCategoryLabelsFromSearch(search: string): string[] | null {
  const params = new URLSearchParams(search);
  const raw = params.get(CATEGORIES_PARAM);
  if (!raw) return null;
  const labels = raw
    .split(',')
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean);
  return labels.length > 0 ? labels : null;
}

export function buildAnalyticsCategoryUrl(categoryLabel: string): string {
  const params = new URLSearchParams();
  params.set(CATEGORIES_PARAM, categoryLabel);
  return `${paths.analytics}?${params.toString()}#expense-categorization`;
}

export function buildMoneyDiaryUrl(options: {
  categoryIds?: string[];
  categoryLabels?: string[];
  selection?: PeriodSelection;
  direction?: 'spent' | 'received';
}): string {
  const params = new URLSearchParams();

  if (options.direction) {
    params.set('direction', options.direction);
  }

  const categoryIds = options.categoryIds?.filter(Boolean) ?? [];
  const categoryLabels = options.categoryLabels?.filter(Boolean) ?? [];

  if (categoryIds.length === 1) {
    params.set('categoryId', categoryIds[0]);
  } else if (categoryIds.length > 1) {
    params.set('categoryIds', categoryIds.join(','));
  }

  if (categoryLabels.length > 0) {
    params.set(CATEGORIES_PARAM, categoryLabels.join(','));
  }

  if (options.selection) {
    const range = resolvePeriodRange(options.selection);
    params.set('spentFrom', toDateInputValue(range.start));
    params.set('spentTo', toDateInputValue(range.end));
  }

  const query = params.toString();
  return query ? `${paths.transactions}?${query}` : paths.transactions;
}

export function parseMoneyDiaryFiltersFromSearch(search: string): {
  categoryId?: string;
  categoryIds?: string[];
  categories?: string[];
  direction?: 'received' | 'spent';
  spentFrom?: string;
  spentTo?: string;
} {
  const params = new URLSearchParams(search);
  const direction = params.get('direction');
  const categoryIdsRaw = params.get('categoryIds');
  const categoriesRaw = params.get(CATEGORIES_PARAM);

  return {
    categoryId: params.get('categoryId') ?? undefined,
    categoryIds: categoryIdsRaw
      ? categoryIdsRaw.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined,
    categories: categoriesRaw
      ? categoriesRaw.split(',').map((label) => decodeURIComponent(label.trim())).filter(Boolean)
      : undefined,
    direction:
      direction === 'received' || direction === 'spent' ? direction : undefined,
    spentFrom: params.get('spentFrom') ?? undefined,
    spentTo: params.get('spentTo') ?? undefined,
  };
}
