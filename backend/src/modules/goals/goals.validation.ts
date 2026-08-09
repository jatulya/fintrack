import { body, param } from 'express-validator';

const optionalUuidArray = (field: string, message: string) => [
  body(field)
    .optional()
    .isArray()
    .withMessage(message),
  body(`${field}.*`)
    .isUUID()
    .withMessage(`Each ${field.slice(0, -3)} ID must be a valid UUID`),
];

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
  ...optionalUuidArray('recurringPaymentIds', 'Recurring payment IDs must be an array'),
  ...optionalUuidArray('transactionIds', 'Transaction IDs must be an array'),
  body().custom((_, { req }) => {
    const recurringIds = req.body.recurringPaymentIds;
    const transactionIds = req.body.transactionIds;
    const hasRecurring = Array.isArray(recurringIds) && recurringIds.length > 0;
    const hasTransactions = Array.isArray(transactionIds) && transactionIds.length > 0;
    if (!hasRecurring && !hasTransactions) {
      throw new Error('Link at least one recurring payment or transaction');
    }
    return true;
  }),
];

export const updateGoalValidation = [
  param('id').isUUID().withMessage('Goal ID must be a valid UUID'),
  body('name')
    .optional()
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
    .optional()
    .isISO8601({ strict: true })
    .withMessage('A valid target date is required (YYYY-MM-DD)'),
  body('targetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be greater than 0')
    .toFloat(),
  ...optionalUuidArray('recurringPaymentIds', 'Recurring payment IDs must be an array'),
  ...optionalUuidArray('transactionIds', 'Transaction IDs must be an array'),
];
