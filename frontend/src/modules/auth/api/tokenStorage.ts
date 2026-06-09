/**
 * Access tokens are kept in memory only — never localStorage/sessionStorage.
 * Refresh tokens live in httpOnly cookies managed by the backend.
 */
let accessToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    return accessToken;
  },

  set(token: string | null): void {
    accessToken = token;
  },

  clear(): void {
    accessToken = null;
  },
};
