import { httpClient } from "./httpClient";
import type {
  ApiResult,
  AuthResponse,
  LoginCredentials,
  PublicUserDetails,
  RegisterCredentials,
} from "../types/authTypes";

export const authApi = {
  register(credentials: RegisterCredentials) {
    return httpClient<ApiResult<AuthResponse>>("/auth/register", {
      method: "POST",
      body: credentials,
      skipAuth: true,
    });
  },

  login(credentials: LoginCredentials) {
    return httpClient<ApiResult<AuthResponse>>("/auth/login", {
      method: "POST",
      body: credentials,
      skipAuth: true,
    });
  },

  refresh() {
    return httpClient<ApiResult<AuthResponse>>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
    });
  },

  logout() {
    return httpClient<ApiResult<{ message: string }>>("/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return httpClient<ApiResult<{ user: PublicUserDetails }>>("/auth/me", {
      method: "GET",
    });
  },
};
