import type { Request, Response, NextFunction } from 'express';
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
}

export const transactionsController = new TransactionsController();
