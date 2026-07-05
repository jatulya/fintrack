import type { ComponentType } from 'react';
import { AccountsView } from '../../modules/accounts/ui/AccountsView';
import { AnalyticsView } from '../../modules/analytics/ui/AnalyticsView';
import Dashboard from '../../modules/dashboard/Dashboard';
import { CategoriesView } from '../../modules/categories/ui/CategoriesView';
import { SavingsView } from '../../modules/savings/ui/SavingsView';
import { TransactionsView } from '../../modules/transactions/ui/TransactionsView';
import { paths, type AppPath } from './paths';

interface RouteConfig {
  path: AppPath;
  element: ComponentType;
}

export const routes: RouteConfig[] = [
  { path: paths.dashboard, element: Dashboard },
  { path: paths.accounts, element: AccountsView },
  { path: paths.categories, element: CategoriesView },
  { path: paths.transactions, element: TransactionsView },
  { path: paths.savings, element: SavingsView },
  { path: paths.analytics, element: AnalyticsView },
];
