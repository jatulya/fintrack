import dotenv from 'dotenv';
import { errorMessages } from '../common/texts/strings.js';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(errorMessages.config.missingEnv(key));
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  isProduction: process.env.NODE_ENV === 'production',

  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  corsOrigin: process.env.CORS_ORIGIN,

  cookieName: process.env.REFRESH_TOKEN_COOKIE_NAME,
};
