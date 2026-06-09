import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { ErrorCode } from '../common/texts/errorCodes.js';
import { errorMessages } from '../common/texts/strings.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: {
      message: errorMessages.general.internalError,
      code: ErrorCode.INTERNAL_ERROR,
    },
  });
}
