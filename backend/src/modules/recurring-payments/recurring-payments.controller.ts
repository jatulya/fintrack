import type { Request, Response, NextFunction } from 'express';
import { recurringPaymentsService } from './recurring-payments.service.js';

export class RecurringPaymentsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recurringPayments = await recurringPaymentsService.list(req.user!.sub);
      res.json({ success: true, data: { recurringPayments } });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recurringPayment = await recurringPaymentsService.create(req.user!.sub, req.body);
      res.status(201).json({ success: true, data: { recurringPayment } });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recurringPayment = await recurringPaymentsService.update(
        req.user!.sub,
        req.params.id as string,
        req.body,
      );
      res.json({ success: true, data: { recurringPayment } });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await recurringPaymentsService.delete(req.user!.sub, req.params.id as string);
      res.json({ success: true, data: { message: 'Recurring payment deleted' } });
    } catch (err) {
      next(err);
    }
  };
}

export const recurringPaymentsController = new RecurringPaymentsController();
