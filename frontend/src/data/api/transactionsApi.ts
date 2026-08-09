import { downloadFile, httpClient, uploadClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type {
  CreateTransactionInput,
  ListTransactionsParams,
  PaginatedTransactionList,
  Transaction,
} from '../models/transactions/types/transactionTypes';

function buildQueryString(params: ListTransactionsParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.direction) searchParams.set('direction', params.direction);
  if (params.accountId) searchParams.set('accountId', params.accountId);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
import type { ImportFormat, ImportJob } from '../models/transactions/types/importTypes';

export const transactionsApi = {
  list(params: ListTransactionsParams = {}) {
    return httpClient<ApiResult<PaginatedTransactionList>>(`/transactions${buildQueryString(params)}`);
  },

  create(input: CreateTransactionInput) {
    return httpClient<ApiResult<{ transaction: Transaction }>>('/transactions', {
      method: 'POST',
      body: input,
    });
  },

  remove(id: string) {
    return httpClient<ApiResult<{ message: string }>>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  getImportFormat() {
    return httpClient<ApiResult<{ format: ImportFormat }>>('/transactions/import/format');
  },

  downloadImportTemplate() {
    return downloadFile('/transactions/import/template', 'transaction-import-template.xlsx');
  },

  startImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return uploadClient<ApiResult<{ job: ImportJob }>>('/transactions/import', formData);
  },

  getImportStatus(jobId: string) {
    return httpClient<ApiResult<{ job: ImportJob }>>(`/transactions/import/${jobId}`);
  },
};
