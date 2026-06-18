import { downloadFile, httpClient, uploadClient } from '../../modules/auth/api/httpClient';
import type { ApiResult } from '../../modules/auth/types/authTypes';
import type { ImportFormat, ImportJob } from '../models/transactions/types/importTypes';
import type { CreateTransactionInput, Transaction } from '../models/transactions/types/transactionTypes';

export const transactionsApi = {
  list() {
    return httpClient<ApiResult<{ transactions: Transaction[] }>>('/transactions');
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
