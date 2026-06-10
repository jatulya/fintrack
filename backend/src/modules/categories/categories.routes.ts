import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { categoriesController } from './categories.controller.js';
import { createCategoryValidation } from './categories.validation.js';

export const categoriesRouter = Router();

categoriesRouter.use(authenticate);

categoriesRouter.get('/', categoriesController.list);
categoriesRouter.post('/', createCategoryValidation, validateRequest, categoriesController.create);
