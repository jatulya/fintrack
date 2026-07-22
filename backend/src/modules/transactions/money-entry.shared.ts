import { body, type ValidationChain } from 'express-validator';
import type { TransactionDirection } from './transactions.types.js';

/** Fields shared by one-off transactions and recurring payment templates. */
export interface MoneyEntryFields {
  accountId: string;
  categoryId: string;
  amount: number;
  direction: TransactionDirection;
  notes?: string;
  affectsBalance?: boolean;
}

export const moneyEntryValidation: ValidationChain[] = [
  body('accountId')
    .isUUID()
    .withMessage('A valid account ID is required'),
  body('categoryId')
    .isUUID()
    .withMessage('A valid category ID is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
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
