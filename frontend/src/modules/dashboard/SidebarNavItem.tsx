import { Link } from 'react-router-dom';
import type { SidebarNavItemConfig } from './sidebarNavItems';

interface SidebarNavItemProps {
  item: SidebarNavItemConfig;
  active: boolean;
}

export const SidebarNavItem = ({ item, active }: SidebarNavItemProps) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`glass-nav-item ${active ? 'glass-nav-item-active' : 'glass-nav-item-inactive'}`}
    >
      <Icon size={20} />
      <span className="sidebar-nav-label">{item.label}</span>
    </Link>
  );
};
