import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadTransactionExcel } from '../../middleware/upload.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { transactionsController } from './transactions.controller.js';
import {
  createTransactionValidation,
  importJobIdParam,
  transactionIdParam,
} from './transactions.validation.js';

export const transactionsRouter = Router();

transactionsRouter.use(authenticate);

transactionsRouter.get('/import/format', transactionsController.getImportFormat);
transactionsRouter.get('/import/template', transactionsController.downloadImportTemplate);
transactionsRouter.post('/import', uploadTransactionExcel, transactionsController.startImport);
transactionsRouter.get('/import/:jobId', importJobIdParam, validateRequest, transactionsController.getImportStatus);

transactionsRouter.get('/', transactionsController.list);
transactionsRouter.post('/', createTransactionValidation, validateRequest, transactionsController.create);
transactionsRouter.delete('/:id', transactionIdParam, validateRequest, transactionsController.remove);
