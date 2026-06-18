import { body, param, query } from 'express-validator';

export const TRANSACTIONS_PAGE_SIZE = 25;

export const listTransactionsValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: TRANSACTIONS_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${TRANSACTIONS_PAGE_SIZE}`)
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be zero or greater')
    .toInt(),
  query('direction')
    .optional()
    .isIn(['received', 'spent'])
    .withMessage('Direction must be received or spent'),
  query('accountId')
    .optional()
    .isUUID()
    .withMessage('A valid account ID is required'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must not exceed 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['spentAt', 'amount'])
    .withMessage('sortBy must be spentAt or amount'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
];

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

export const importJobIdParam = [
  param('jobId').isUUID().withMessage('A valid import job ID is required'),
];
