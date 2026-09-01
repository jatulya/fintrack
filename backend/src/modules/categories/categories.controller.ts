import type { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service.js';

export class CategoriesController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await categoriesService.list(req.user!.sub);
      res.json({ success: true, data: { categories } });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await categoriesService.create(req.user!.sub, req.body);
      res.status(201).json({ success: true, data: { category } });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await categoriesService.update(
        req.user!.sub,
        req.params.id as string,
        req.body,
      );
      res.json({ success: true, data: { category } });
    } catch (err) {
      next(err);
    }
  };
}

export const categoriesController = new CategoriesController();
