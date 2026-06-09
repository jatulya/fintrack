import { ErrorCode } from '../common/texts/errorCodes.js';
import { defaultErrorCodes, errorMessages } from '../common/texts/strings.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(401, message ?? errorMessages.general.unauthorized, defaultErrorCodes.unauthorized);
  }
}

export class ConflictError extends AppError {
  constructor(message?: string) {
    super(409, message ?? errorMessages.general.conflict, defaultErrorCodes.conflict);
  }
}

export class ValidationError extends AppError {
  constructor(message?: string) {
    super(400, message ?? errorMessages.general.validationFailed, defaultErrorCodes.validation);
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(404, message ?? errorMessages.general.notFound, defaultErrorCodes.notFound);
  }
}
