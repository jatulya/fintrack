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

export const importJobIdParam = [
  param('jobId').isUUID().withMessage('A valid import job ID is required'),
];
