import { authRepository } from './auth.repository.js';
import type {
  AuthResponse,
  LoginInput,
  PublicUser,
  RegisterInput,
  SupabaseAuthUser,
} from './auth.types.js';
import { ConflictError, UnauthorizedError, AppError } from '../../utils/errors.js';
import { ErrorCode } from '../../common/texts/errorCodes.js';
import { errorMessages } from '../../common/texts/strings.js';

function toPublicUser(authUser: SupabaseAuthUser, profileFullName?: string | null): PublicUser {
  const metaName = authUser.user_metadata?.full_name ?? null;
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    fullName: profileFullName ?? metaName,
    createdAt: authUser.created_at ?? new Date().toISOString(),
  };
}

function mapSupabaseAuthError(error: unknown, fallback: string): AppError {
  const message = error instanceof Error ? error.message : fallback;

  if (message.toLowerCase().includes('already registered') ||
      message.toLowerCase().includes('already been registered')) {
    return new ConflictError(errorMessages.auth.emailAlreadyExists);
  }

  if (message.toLowerCase().includes('invalid login credentials') ||
      message.toLowerCase().includes('invalid email or password')) {
    return new UnauthorizedError(errorMessages.auth.invalidCredentials);
  }

  return new AppError(400, fallback, ErrorCode.AUTH_ERROR);
}

export class AuthService {
  constructor(private readonly repo = authRepository) {}

  async register(input: RegisterInput): Promise<AuthResponse & { refreshToken: string }> {
    try {
      const authUser = await this.repo.signUp(input.email, input.password, input.fullName);
      await this.repo.upsertProfile(authUser.id, input.fullName);

      const session = await this.repo.signIn(input.email, input.password);
      const profile = await this.repo.findProfile(authUser.id);

      return {
        user: toPublicUser(authUser, profile?.full_name),
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      };
    } catch (err) {
      throw mapSupabaseAuthError(err, errorMessages.auth.unableToCreateAccount);
    }
  }

  async login(input: LoginInput): Promise<AuthResponse & { refreshToken: string }> {
    try {
      const session = await this.repo.signIn(input.email, input.password);
      const authUser = await this.repo.getUserByAccessToken(session.access_token);
      const profile = await this.repo.findProfile(authUser.id);

      return {
        user: toPublicUser(authUser, profile?.full_name),
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      };
    } catch {
      throw new UnauthorizedError(errorMessages.auth.invalidCredentials);
    }
  }

  async refresh(refreshToken: string): Promise<AuthResponse & { refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedError(errorMessages.auth.missingRefreshToken);
    }

    try {
      const session = await this.repo.refreshSession(refreshToken);
      const authUser = await this.repo.getUserByAccessToken(session.access_token);
      const profile = await this.repo.findProfile(authUser.id);

      return {
        user: toPublicUser(authUser, profile?.full_name),
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      };
    } catch {
      throw new UnauthorizedError(errorMessages.auth.invalidOrExpiredRefreshToken);
    }
  }

  async logout(accessToken: string | undefined): Promise<void> {
    if (!accessToken) return;

    try {
      await this.repo.signOut(accessToken);
    } catch {
      // Session may already be invalid — treat as logged out
    }
  }

  async getProfile(userId: string, accessToken: string): Promise<PublicUser> {
    const authUser = await this.repo.getUserByAccessToken(accessToken);

    if (authUser.id !== userId) {
      throw new UnauthorizedError(errorMessages.auth.tokenDoesNotMatchUser);
    }

    const profile = await this.repo.findProfile(userId);
    return toPublicUser(authUser, profile?.full_name);
  }
}

export const authService = new AuthService();
