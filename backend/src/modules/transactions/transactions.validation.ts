import { body, param, query } from 'express-validator';
import { moneyEntryValidation } from './money-entry.shared.js';

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
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('A valid category ID is required'),
  query('categoryIds')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      if (typeof value !== 'string') {
        throw new Error('categoryIds must be a comma-separated list of UUIDs');
      }
      const ids = value.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length === 0) return true;
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!ids.every((id) => uuidPattern.test(id))) {
        throw new Error('categoryIds must contain valid UUIDs');
      }
      return true;
    }),
  query('spentFrom')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('spentFrom must be a valid date (YYYY-MM-DD)'),
  query('spentTo')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('spentTo must be a valid date (YYYY-MM-DD)'),
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
  ...moneyEntryValidation,
  body('spentAt')
    .isISO8601({ strict: true })
    .withMessage('A valid date is required (YYYY-MM-DD)'),
];

export const transactionIdParam = [
  param('id').isUUID().withMessage('A valid transaction ID is required'),
];

export const updateTransactionValidation = [
  ...transactionIdParam,
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
  body('spentAt')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('A valid date is required (YYYY-MM-DD)'),
];

export const importJobIdParam = [
  param('jobId').isUUID().withMessage('A valid import job ID is required'),
];
