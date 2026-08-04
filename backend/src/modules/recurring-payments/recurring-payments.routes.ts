import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { recurringPaymentsController } from './recurring-payments.controller.js';
import {
  createRecurringPaymentValidation,
  recurringPaymentIdParam,
  updateRecurringPaymentValidation,
} from './recurring-payments.validation.js';

export const recurringPaymentsRouter = Router();

recurringPaymentsRouter.use(authenticate);

recurringPaymentsRouter.get('/', recurringPaymentsController.list);
recurringPaymentsRouter.post('/', createRecurringPaymentValidation, validateRequest, recurringPaymentsController.create);
recurringPaymentsRouter.patch('/:id', updateRecurringPaymentValidation, validateRequest, recurringPaymentsController.update);
recurringPaymentsRouter.delete('/:id', recurringPaymentIdParam, validateRequest, recurringPaymentsController.remove);
