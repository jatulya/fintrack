export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportJob {
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
