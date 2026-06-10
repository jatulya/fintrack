export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: { full_name?: string };
}
