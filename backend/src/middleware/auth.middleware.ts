import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { UnauthorizedError } from '../utils/errors.js';
import { errorMessages } from '../common/texts/strings.js';

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; email: string };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError(errorMessages.auth.missingOrInvalidAuthHeader));
    return;
  }

  const token = header.slice(7);

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      next(new UnauthorizedError(errorMessages.auth.invalidOrExpiredAccessToken));
      return;
    }

    req.user = {
      sub: data.user.id,
      email: data.user.email ?? '',
    };
    next();
  } catch {
    next(new UnauthorizedError(errorMessages.auth.invalidOrExpiredAccessToken));
  }
}
