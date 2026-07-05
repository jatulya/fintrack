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
import { strings } from '../../common/texts/strings';

export interface SidebarNavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  highlightWhenActive?: boolean;
}

export const sidebarNavItems: SidebarNavItemConfig[] = [
  { to: '/dashboard', label: strings.navCozyCorner, icon: LayoutDashboard },
  { to: '/dashboard/accounts', label: strings.navStashes, icon: Wallet },
  { to: '/dashboard/categories', label: strings.navThemes, icon: Tag },
  { to: '/dashboard/transactions', label: strings.navMoneyDiary, icon: ArrowLeftRight },
  { to: '/dashboard/savings', label: strings.navPiggyBank, icon: TrendingUp },
  { to: '/dashboard/analytics', label: strings.navFinancialStory, icon: PieChart },
  { to: '/dashboard', label: strings.navCustomize, icon: Settings, highlightWhenActive: false },
];
