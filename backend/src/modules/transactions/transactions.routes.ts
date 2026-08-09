import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadTransactionExcel } from '../../middleware/upload.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { transactionsController } from './transactions.controller.js';
import {
  createTransactionValidation,
  listTransactionsValidation,
  importJobIdParam,
  transactionIdParam,
  updateTransactionValidation,
} from './transactions.validation.js';

export const transactionsRouter = Router();

transactionsRouter.use(authenticate);

transactionsRouter.get('/', listTransactionsValidation, validateRequest, transactionsController.list);
transactionsRouter.get('/import/format', transactionsController.getImportFormat);
transactionsRouter.get('/import/template', transactionsController.downloadImportTemplate);
transactionsRouter.post('/import', uploadTransactionExcel, transactionsController.startImport);
transactionsRouter.get('/import/:jobId', importJobIdParam, validateRequest, transactionsController.getImportStatus);

transactionsRouter.post('/', createTransactionValidation, validateRequest, transactionsController.create);
transactionsRouter.patch('/:id', updateTransactionValidation, validateRequest, transactionsController.update);
transactionsRouter.delete('/:id', transactionIdParam, validateRequest, transactionsController.remove);
