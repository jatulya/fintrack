import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { transactionsController } from './transactions.controller.js';
import { createTransactionValidation, transactionIdParam } from './transactions.validation.js';

export const transactionsRouter = Router();

transactionsRouter.use(authenticate);

transactionsRouter.get('/', transactionsController.list);
transactionsRouter.post('/', createTransactionValidation, validateRequest, transactionsController.create);
transactionsRouter.delete('/:id', transactionIdParam, validateRequest, transactionsController.remove);
