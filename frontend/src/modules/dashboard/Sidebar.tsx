import { LogOut, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { paths } from '../../common/routes/paths';
import { strings } from '../../common/texts/strings';
import { SidebarNavItem } from './SidebarNavItem';
import { sidebarNavItems } from './sidebarNavItems';

interface SidebarProps {
  onQuickAdd: () => void;
  onLogout: () => void;
}

const isNavActive = (item: (typeof sidebarNavItems)[number], pathname: string) => {
  if (item.highlightWhenActive === false) {
    return false;
  }
  if (item.to === paths.dashboard) {
    return pathname === paths.dashboard;
  }
  return pathname.startsWith(item.to);
};

export const Sidebar = ({ onQuickAdd, onLogout }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <nav className="sidebar hidden lg:flex flex-col">
      <div className="sidebar-header">
        <img src="/assets/logo.svg" alt="" className="sidebar-logo" aria-hidden="true" />
        <span className="sidebar-title">{strings.appTitle}</span>
      </div>

      <div className="sidebar-nav-list">
        {sidebarNavItems.map((item) => (
          <SidebarNavItem
            key={`${item.to}-${item.label}`}
            item={item}
            active={isNavActive(item, pathname)}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <button type="button" className="glass-btn glass-btn-accent w-full" onClick={onQuickAdd}>
          <Plus size={20} />
          <span>{strings.sidebarQuickAdd}</span>
        </button>

        <button type="button" className="glass-btn glass-btn-ghost w-full justify-start" onClick={onLogout} title="Sign out">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
