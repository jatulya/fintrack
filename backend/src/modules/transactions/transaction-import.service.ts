import { accountsRepository } from '../accounts/accounts.repository.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { transactionsService } from './transactions.service.js';
import {
  appendImportError,
  createImportJob,
  getImportJob,
  setImportStatus,
  updateImportJob,
} from './transaction-import.jobs.js';
import { buildImportTemplateBuffer, parseTransactionExcel } from './transaction-import.parser.js';
import type {
  ImportFormat,
  ParsedImportRow,
  PublicImportJob,
} from './transaction-import.types.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { errorMessages } from '../../common/texts/strings.js';

export const TRANSACTION_IMPORT_FORMAT: ImportFormat = {
  sheetName: 'Transactions',
  columns: [
    {
      name: 'Account Name',
      required: true,
      description: 'Must exactly match an existing account name in your vault.',
      example: 'HDFC Savings',
    },
    {
      name: 'Category Label',
      required: true,
      description: 'Must exactly match an existing category label (e.g. dining, salary).',
      example: 'dining',
    },
    {
      name: 'Amount',
      required: true,
      description: 'Positive number greater than zero.',
      example: '450',
    },
    {
      name: 'Date',
      required: true,
      description: 'Transaction date in YYYY-MM-DD format.',
      example: '2026-06-11',
    },
    {
      name: 'Direction',
      required: true,
      description: 'Use received for income or spent for expenses.',
      example: 'spent',
    },
    {
      name: 'Notes',
      required: false,
      description: 'Optional description for the transaction.',
      example: 'Lunch',
    },
    {
      name: 'Affects Balance',
      required: false,
      description: 'yes/no — whether this transaction updates the account balance. Defaults to yes.',
      example: 'yes',
    },
  ],
  exampleRows: [
    {
      'Account Name': 'HDFC Savings',
      'Category Label': 'dining',
      Amount: '450',
      Date: '2026-06-11',
      Direction: 'spent',
      Notes: 'Lunch',
      'Affects Balance': 'yes',
    },
    {
      'Account Name': 'Cash Wallet',
      'Category Label': 'entertainment',
      Amount: '200',
      Date: '2026-06-05',
      Direction: 'spent',
      Notes: 'Tracked only',
      'Affects Balance': 'no',
    },
  ],
};

function toPublicJob(job: ReturnType<typeof getImportJob>): PublicImportJob {
  return {
    id: job!.id,
    status: job!.status,
    totalRows: job!.totalRows,
    processedRows: job!.processedRows,
    succeededRows: job!.succeededRows,
    failedRows: job!.failedRows,
    errors: job!.errors,
    createdAt: job!.createdAt,
    completedAt: job!.completedAt,
  };
}

export class TransactionImportService {
  constructor(
    private readonly accountsRepo = accountsRepository,
    private readonly categoriesRepo = categoriesRepository,
    private readonly transactions = transactionsService,
  ) {}

  getFormat(): ImportFormat {
    return TRANSACTION_IMPORT_FORMAT;
  }

  getTemplateBuffer(): Buffer {
    return buildImportTemplateBuffer();
  }

  startImport(userId: string, fileBuffer: Buffer): PublicImportJob {
    const rows = parseTransactionExcel(fileBuffer);
    const job = createImportJob(userId, rows.length);

    setImmediate(() => {
      void this.processJob(job.id, userId, rows);
    });

    return toPublicJob(job);
  }

  getJobStatus(jobId: string, userId: string): PublicImportJob {
    const job = getImportJob(jobId, userId);
    if (!job) {
      throw new NotFoundError(errorMessages.financial.importJobNotFound);
    }
    return toPublicJob(job);
  }

  private async processJob(jobId: string, userId: string, rows: ParsedImportRow[]): Promise<void> {
    setImportStatus(jobId, 'processing');

    const accounts = await this.accountsRepo.findAllByUser(userId);
    const categories = await this.categoriesRepo.findAllByUser(userId);

    const accountByName = new Map(
      accounts.map((account) => [account.name.trim().toLowerCase(), account.id]),
    );
    const categoryByLabel = new Map(
      categories.map((category) => [category.label.trim().toLowerCase(), category.id]),
    );

    let processedRows = 0;
    let succeededRows = 0;
    let failedRows = 0;

    for (const row of rows) {
      try {
        const accountId = accountByName.get(row.accountName.toLowerCase());
        if (!accountId) {
          throw new ValidationError(`Account "${row.accountName}" was not found.`);
        }

        const categoryId = categoryByLabel.get(row.categoryLabel.toLowerCase());
        if (!categoryId) {
          throw new ValidationError(`Category label "${row.categoryLabel}" was not found.`);
        }

        await this.transactions.create(userId, {
          accountId,
          categoryId,
          amount: row.amount,
          spentAt: row.spentAt,
          notes: row.notes,
          direction: row.direction,
          affectsBalance: row.affectsBalance,
        });

        succeededRows += 1;
      } catch (err) {
        failedRows += 1;
        const message = err instanceof Error ? err.message : 'Failed to import row.';
        appendImportError(jobId, { row: row.rowNumber, message });
      } finally {
        processedRows += 1;
        updateImportJob(jobId, {
          processedRows,
          succeededRows,
          failedRows,
        });
      }
    }

    updateImportJob(jobId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }
}

export const transactionImportService = new TransactionImportService();
