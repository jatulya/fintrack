import { body, param } from 'express-validator';

export const createAccountValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name must be between 1 and 100 characters')
    .escape(),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .escape(),
];

export const accountIdParam = [
  param('id').isUUID().withMessage('A valid account ID is required'),
];

export const updateAccountValidation = [
  ...accountIdParam,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name must be between 1 and 100 characters')
    .escape(),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .escape(),
];
