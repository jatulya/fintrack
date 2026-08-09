import type { Request, Response, NextFunction } from 'express';
import { goalsService } from './goals.service.js';

export class GoalsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await goalsService.list(req.user!.sub);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goal = await goalsService.create(req.user!.sub, req.body);
      res.status(201).json({ success: true, data: { goal } });
    } catch (err) {
      next(err);
    }
  };
}

export const goalsController = new GoalsController();
