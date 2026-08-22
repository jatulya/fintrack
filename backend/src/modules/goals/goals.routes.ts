import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { goalsController } from './goals.controller.js';
import { createGoalValidation, updateGoalValidation } from './goals.validation.js';

export const goalsRouter = Router();

goalsRouter.use(authenticate);

goalsRouter.get('/', goalsController.list);
goalsRouter.post('/', createGoalValidation, validateRequest, goalsController.create);
goalsRouter.patch('/:id', updateGoalValidation, validateRequest, goalsController.update);
