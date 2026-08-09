import { body } from 'express-validator';

export const createGoalValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Goal name must be between 1 and 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .escape(),
  body('targetDate')
    .isISO8601({ strict: true })
    .withMessage('A valid target date is required (YYYY-MM-DD)'),
  body('targetAmount')
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be greater than 0')
    .toFloat(),
  body('recurringPaymentIds')
    .isArray({ min: 1 })
    .withMessage('At least one recurring payment is required'),
  body('recurringPaymentIds.*')
    .isUUID()
    .withMessage('Each recurring payment ID must be a valid UUID'),
];
