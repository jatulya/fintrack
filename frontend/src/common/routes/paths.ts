export const paths = {
  login: '/',
  register: '/register',
  dashboard: '/dashboard',
  accounts: '/accounts',
  categories: '/categories',
  transactions: '/transactions',
  savings: '/savings',
  analytics: '/analytics',
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
