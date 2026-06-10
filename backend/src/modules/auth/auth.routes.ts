import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { ErrorCode } from '../../common/texts/errorCodes.js';
import { errorMessages } from '../../common/texts/strings.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: errorMessages.general.rateLimited,
      code: ErrorCode.RATE_LIMITED,
    },
  },
});

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  registerValidation,
  validateRequest,
  authController.register,
);

authRouter.post(
  '/login',
  authLimiter,
  loginValidation,
  validateRequest,
  authController.login,
);

authRouter.post('/refresh', authLimiter, authController.refresh);

authRouter.post('/logout', authController.logout);

authRouter.get('/me', authenticate, authController.me);
