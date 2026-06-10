import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { accountsController } from './accounts.controller.js';
import { createAccountValidation } from './accounts.validation.js';

export const accountsRouter = Router();

accountsRouter.use(authenticate);

accountsRouter.get('/', accountsController.list);
accountsRouter.post('/', createAccountValidation, validateRequest, accountsController.create);
