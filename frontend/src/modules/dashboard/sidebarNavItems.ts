import {
  ArrowLeftRight,
  LayoutDashboard,
  PieChart,
  Settings,
  Tag,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '../../common/routes/paths';
import { strings } from '../../common/texts/strings';

export interface SidebarNavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  highlightWhenActive?: boolean;
}

export const sidebarNavItems: SidebarNavItemConfig[] = [
  { to: paths.dashboard, label: strings.navCozyCorner, icon: LayoutDashboard },
  { to: paths.accounts, label: strings.navStashes, icon: Wallet },
  { to: paths.categories, label: strings.navThemes, icon: Tag },
  { to: paths.transactions, label: strings.navMoneyDiary, icon: ArrowLeftRight },
  { to: paths.savings, label: strings.navPiggyBank, icon: TrendingUp },
  { to: paths.analytics, label: strings.navFinancialStory, icon: PieChart },
  { to: paths.dashboard, label: strings.navCustomize, icon: Settings, highlightWhenActive: false },
];

export const bottomNavItems: SidebarNavItemConfig[] = [
  { to: paths.dashboard, label: strings.navCozyCorner, icon: LayoutDashboard },
  { to: paths.accounts, label: strings.navStashes, icon: Wallet },
  { to: paths.transactions, label: strings.navMoneyDiary, icon: ArrowLeftRight },
  { to: paths.savings, label: strings.navPiggyBank, icon: TrendingUp },
];
