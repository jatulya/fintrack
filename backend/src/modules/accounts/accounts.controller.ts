import type { Request, Response, NextFunction } from 'express';
import { accountsService } from './accounts.service.js';

export class AccountsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accounts = await accountsService.list(req.user!.sub);
      res.json({ success: true, data: { accounts } });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const account = await accountsService.create(req.user!.sub, req.body);
      res.status(201).json({ success: true, data: { account } });
    } catch (err) {
      next(err);
    }
  };
}

export const accountsController = new AccountsController();
