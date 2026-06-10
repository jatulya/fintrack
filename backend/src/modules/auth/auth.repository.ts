import { supabaseAdmin, supabaseAuth } from '../../config/supabase.js';
import type { Profile, SupabaseAuthUser } from './auth.types.js';

const PROFILES_TABLE = 'profiles';

export class AuthRepository {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName ?? null },
    });

    if (error) throw error;
    return data.user!;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) throw error;
    return data.session!;
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return data.session!;
  }

  async getUserByAccessToken(accessToken: string): Promise<SupabaseAuthUser> {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error) throw error;
    return data.user;
  }

  async signOut(accessToken: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, 'global');
    if (error) throw error;
  }

  async findProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin
      .from(PROFILES_TABLE)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  }

  async upsertProfile(userId: string, fullName?: string): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from(PROFILES_TABLE)
      .upsert({
        id: userId,
        full_name: fullName ?? null,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Profile;
  }
}

export const authRepository = new AuthRepository();
