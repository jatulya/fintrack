import { body } from 'express-validator';
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
