import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export class DashboardController {
  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await dashboardService.getSummary(req.user!.sub);
      res.json({ success: true, data: { summary } });
    } catch (err) {
      next(err);
    }
  };
}

export const dashboardController = new DashboardController();
