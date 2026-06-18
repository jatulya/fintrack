import { body } from 'express-validator';

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
];
