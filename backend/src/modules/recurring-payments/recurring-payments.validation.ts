import { body, param } from 'express-validator';
import { moneyEntryValidation } from '../transactions/money-entry.shared.js';

export const createRecurringPaymentValidation = [
  ...moneyEntryValidation,
  body('frequency')
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Frequency must be weekly, monthly, or yearly'),
  body('startDate')
    .isISO8601({ strict: true })
    .withMessage('A valid start date is required (YYYY-MM-DD)'),
];

export const recurringPaymentIdParam = [
  param('id').isUUID().withMessage('A valid recurring payment ID is required'),
];

export const updateRecurringPaymentValidation = [
  ...recurringPaymentIdParam,
  body('accountId')
    .optional()
    .isUUID()
    .withMessage('A valid account ID is required'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('A valid category ID is required'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .escape(),
  body('direction')
    .optional()
    .isIn(['received', 'spent'])
    .withMessage('Direction must be received or spent'),
  body('affectsBalance')
    .optional()
    .isBoolean()
    .withMessage('affectsBalance must be a boolean'),
  body('frequency')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Frequency must be weekly, monthly, or yearly'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];
