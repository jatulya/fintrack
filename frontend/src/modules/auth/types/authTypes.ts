export interface PublicUser {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}
