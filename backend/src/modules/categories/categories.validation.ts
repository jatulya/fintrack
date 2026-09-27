import { body, param } from 'express-validator';

const monthlyBudgetRule = body('monthlyBudget')
  .optional({ nullable: true })
  .custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
      throw new Error('Monthly budget must be a non-negative whole number');
    }
    return true;
  });

export const createCategoryValidation = [
  body('label')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Label must be between 1 and 50 characters')
    .escape(),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Description must be between 1 and 100 characters')
    .escape(),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .escape(),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex code'),
  monthlyBudgetRule,
];

export const categoryIdParam = [
  param('id').isUUID().withMessage('A valid category ID is required'),
];

export const updateCategoryValidation = [
  ...categoryIdParam,
  body('label')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Label must be between 1 and 50 characters')
    .escape(),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Description must be between 1 and 100 characters')
    .escape(),
  body('icon')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== 'string' || value.trim().length > 50) {
        throw new Error('Icon must be at most 50 characters');
      }
      return true;
    }),
  body('color')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
        throw new Error('Color must be a valid hex code');
      }
      return true;
    }),
  monthlyBudgetRule,
];
