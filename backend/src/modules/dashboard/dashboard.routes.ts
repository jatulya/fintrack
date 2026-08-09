import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { dashboardController } from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/summary', dashboardController.getSummary);
