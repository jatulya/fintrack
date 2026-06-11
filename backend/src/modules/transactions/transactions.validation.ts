import { body, param } from 'express-validator';

export const createTransactionValidation = [
  body('accountId')
    .isUUID()
    .withMessage('A valid account ID is required'),
  body('categoryId')
    .isUUID()
    .withMessage('A valid category ID is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('spentAt')
    .isISO8601({ strict: true })
    .withMessage('A valid date is required (YYYY-MM-DD)'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .escape(),
  body('direction')
    .isIn(['received', 'spent'])
    .withMessage('Direction must be received or spent'),
  body('affectsBalance')
    .optional()
    .isBoolean()
    .withMessage('affectsBalance must be a boolean'),
];

export const transactionIdParam = [
  param('id').isUUID().withMessage('A valid transaction ID is required'),
];
