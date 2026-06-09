import { body } from 'express-validator';
import { validationMessages } from '../../common/texts/strings.js';

const emailValidator = body('email')
  .trim()
  .isEmail()
  .withMessage(validationMessages.emailRequired)
  .normalizeEmail()
  .isLength({ max: 255 })
  .withMessage(validationMessages.emailMaxLength);

const passwordValidator = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage(validationMessages.passwordLength)
  .matches(/[a-z]/)
  .withMessage(validationMessages.passwordLowercase)
  .matches(/[A-Z]/)
  .withMessage(validationMessages.passwordUppercase)
  .matches(/[0-9]/)
  .withMessage(validationMessages.passwordNumber);

export const registerValidation = [
  emailValidator,
  passwordValidator,
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(validationMessages.fullNameLength)
    .escape(),
];

export const loginValidation = [
  emailValidator,
  body('password')
    .notEmpty()
    .withMessage(validationMessages.passwordRequired)
    .isLength({ max: 128 })
    .withMessage(validationMessages.passwordMaxLength),
];
