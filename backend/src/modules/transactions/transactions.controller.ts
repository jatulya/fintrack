import type { Request, Response, NextFunction } from 'express';
import { transactionsService } from './transactions.service.js';

export class TransactionsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactions = await transactionsService.list(req.user!.sub);
      res.json({ success: true, data: { transactions } });
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
