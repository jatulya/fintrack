import { ErrorCode } from './errorCodes.js';

export const errorMessages = {
  general: {
    unauthorized: 'Unauthorized',
    notFound: 'Not found',
    conflict: 'Resource already exists',
    validationFailed: 'Validation failed',
    internalError: 'Internal server error',
    rateLimited: 'Too many attempts, please try again later',
  },

  config: {
    missingEnv: (key: string) => `Missing required environment variable: ${key}`,
    missingRefreshTokenCookieName: 'Missing required environment variable: REFRESH_TOKEN_COOKIE_NAME',
  },

  financial: {
    accountNotFound: 'Account not found',
    categoryNotFound: 'Category not found',
    transactionNotFound: 'Transaction not found',
    recurringPaymentNotFound: 'Recurring payment not found',
    importJobNotFound: 'Import job not found',
    importFileRequired: 'An Excel file is required',
    invalidImportFile: 'Only .xlsx, .xls, or .csv files are allowed',
  },

  auth: {
    invalidCredentials: 'Invalid email or password',
    emailAlreadyExists: 'An account with this email already exists',
    unableToCreateAccount: 'Unable to create account',
    missingRefreshToken: 'Missing refresh token',
    invalidOrExpiredRefreshToken: 'Invalid or expired refresh token',
    missingOrInvalidAuthHeader: 'Missing or invalid authorization header',
    invalidOrExpiredAccessToken: 'Invalid or expired access token',
    tokenDoesNotMatchUser: 'Token does not match user',
  },
} as const;

export const successMessages = {
  auth: {
    loggedOut: 'Logged out successfully',
  },
} as const;

export const validationMessages = {
  emailRequired: 'A valid email address is required',
  emailMaxLength: 'Email must not exceed 255 characters',
  passwordLength: 'Password must be between 8 and 128 characters',
  passwordLowercase: 'Password must contain at least one lowercase letter',
  passwordUppercase: 'Password must contain at least one uppercase letter',
  passwordNumber: 'Password must contain at least one number',
  passwordRequired: 'Password is required',
  passwordMaxLength: 'Password must not exceed 128 characters',
  fullNameLength: 'Full name must be between 1 and 100 characters',
} as const;

/** Default error code per HTTP-style error class */
export const defaultErrorCodes = {
  unauthorized: ErrorCode.UNAUTHORIZED,
  conflict: ErrorCode.CONFLICT,
  validation: ErrorCode.VALIDATION_ERROR,
  notFound: ErrorCode.NOT_FOUND,
  auth: ErrorCode.AUTH_ERROR,
  config: ErrorCode.CONFIG_ERROR,
  internal: ErrorCode.INTERNAL_ERROR,
  rateLimited: ErrorCode.RATE_LIMITED,
} as const;
