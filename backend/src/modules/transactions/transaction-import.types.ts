export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportJob {
  id: string;
  userId: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  succeededRows: number;
  failedRows: number;
  errors: ImportRowError[];
  createdAt: string;
  completedAt: string | null;
}

export interface PublicImportJob {
  id: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  succeededRows: number;
  failedRows: number;
  errors: ImportRowError[];
  createdAt: string;
  completedAt: string | null;
}

export interface ImportFormatColumn {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

export interface ImportFormat {
  sheetName: string;
  columns: ImportFormatColumn[];
  exampleRows: Record<string, string>[];
}

export interface ParsedImportRow {
  rowNumber: number;
  accountName: string;
  categoryLabel: string;
  amount: number;
  spentAt: string;
  direction: 'received' | 'spent';
  notes: string;
  affectsBalance: boolean;
}
