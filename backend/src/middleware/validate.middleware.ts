import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';
import { ErrorCode } from '../common/texts/errorCodes.js';

export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    next(new AppError(400, message, ErrorCode.VALIDATION_ERROR));
    return;
  }
  next();
}
