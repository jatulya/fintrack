import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors.js';
import { ErrorCode } from '../../common/texts/errorCodes.js';
import { errorMessages } from '../../common/texts/strings.js';
import { transactionImportService } from './transaction-import.service.js';
import { transactionsService } from './transactions.service.js';
import { TRANSACTIONS_PAGE_SIZE } from './transactions.validation.js';
import type { ListTransactionsQuery, TransactionSortField } from './transactions.types.js';

function parseListQuery(req: Request): ListTransactionsQuery {
  const limit = Math.min(Number(req.query.limit) || TRANSACTIONS_PAGE_SIZE, TRANSACTIONS_PAGE_SIZE);
  const offset = Number(req.query.offset) || 0;
  const sortBy = (req.query.sortBy as TransactionSortField | undefined) ?? 'spentAt';

  return {
    limit,
    offset,
    direction: req.query.direction as ListTransactionsQuery['direction'],
    accountId: req.query.accountId as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
    search: req.query.search as string | undefined,
    sortBy,
    sortOrder: (req.query.sortOrder as 'asc' | 'desc' | undefined) ?? 'desc',
  };
}

export class TransactionsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await transactionsService.list(req.user!.sub, parseListQuery(req));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await transactionsService.create(req.user!.sub, req.body);
      res.status(201).json({ success: true, data: { transaction } });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await transactionsService.delete(req.user!.sub, req.params.id as string);
      res.json({ success: true, data: { message: 'Transaction deleted' } });
    } catch (err) {
      next(err);
    }
  };

  getImportFormat = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: { format: transactionImportService.getFormat() } });
    } catch (err) {
      next(err);
    }
  };

  downloadImportTemplate = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = transactionImportService.getTemplateBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="transaction-import-template.xlsx"');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  startImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file?.buffer) {
        throw new AppError(400, errorMessages.financial.importFileRequired, ErrorCode.VALIDATION_ERROR);
      }

      const job = transactionImportService.startImport(req.user!.sub, req.file.buffer);
      res.status(202).json({ success: true, data: { job } });
    } catch (err) {
      next(err);
    }
  };

  getImportStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = transactionImportService.getJobStatus(req.params.jobId as string, req.user!.sub);
      res.json({ success: true, data: { job } });
    } catch (err) {
      next(err);
    }
  };
}

export const transactionsController = new TransactionsController();
