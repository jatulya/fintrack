import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';
import { ErrorCode } from '../../common/texts/errorCodes.js';
import { errorMessages, successMessages } from '../../common/texts/strings.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict' as const,
  path: env.authCookiePath,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function requireCookieName(): string {
  const name = env.cookieName?.trim();
  if (!name) {
    throw new AppError(
      500,
      errorMessages.config.missingRefreshTokenCookieName,
      ErrorCode.CONFIG_ERROR,
    );
  }
  return name;
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(requireCookieName(), token, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(requireCookieName(), {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: env.authCookiePath,
  });
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;
      const result = await authService.register({ email, password, fullName });

      setRefreshCookie(res, result.refreshToken);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      setRefreshCookie(res, result.refreshToken);

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies[requireCookieName()] as string | undefined;
      const result = await authService.refresh(refreshToken ?? '');

      setRefreshCookie(res, result.refreshToken);

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      clearRefreshCookie(res);
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = extractBearerToken(req);
      await authService.logout(accessToken);
      clearRefreshCookie(res);

      res.json({ success: true, data: { message: successMessages.auth.loggedOut } });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = extractBearerToken(req)!;
      const user = await authService.getProfile(req.user!.sub, accessToken);
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
