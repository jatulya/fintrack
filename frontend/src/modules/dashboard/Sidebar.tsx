import { Plus } from 'lucide-react';
import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { paths } from '../../common/routes/paths';
import { strings } from '../../common/texts/strings';
import { SidebarNavItem } from './SidebarNavItem';
import { sidebarNavItems } from './sidebarNavItems';

interface SidebarProps {
  onQuickAdd: () => void;
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

export const Sidebar = ({ onQuickAdd }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-header clay-surface rounded-2xl px-3 py-2">
        <img src="/assets/logo.svg" alt="" className="sidebar-logo" aria-hidden="true" />
        <span className="sidebar-title">{strings.appTitle}</span>
      </div>

      <div className="sidebar-nav-list">
        {sidebarNavItems.map((item) => (
          <Fragment key={`${item.to}-${item.label}`}>
            <SidebarNavItem item={item} active={isNavActive(item, pathname)} />
            {item.label === strings.navCustomize && (
              <button type="button" className="clay-btn w-full sidebar-quick-add" onClick={onQuickAdd}>
                <Plus size={20} />
                <span>{strings.sidebarQuickAdd}</span>
              </button>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
};
