import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { GlassCard } from '../../common/components';
import { AddTransactionModal } from '../transactions/ui/AddTransactionModal';
import { DashboardPageHeader } from './DashboardPageHeader';
import { Sidebar } from './Sidebar';
import { bottomNavItems } from './sidebarNavItems';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar onQuickAdd={() => setIsAddModalOpen(true)} />

      <div className="app-main">
        <main className="page-container pb-24 lg:pb-8">
          <DashboardPageHeader />
          <div className="page-content">{children}</div>
        </main>

        <nav className="bottom-nav lg:hidden">
          <GlassCard className="p-2 px-6 flex justify-between items-center rounded-3xl">
            {bottomNavItems.slice(0, 2).map((item) => (
              <NavItem
                key={item.to}
                item={item}
                active={location.pathname === item.to}
              />
            ))}
            <div className="mb-8">
              <div className="fab" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={32} />
              </div>
            </div>
            {bottomNavItems.slice(2).map((item) => (
              <NavItem
                key={item.to}
                item={item}
                active={location.pathname === item.to}
              />
            ))}
          </GlassCard>
        </nav>

        {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}
      </div>
    </div>
  );
};

export default DashboardLayout;

const NavItem = ({
  item,
  active,
}: {
  item: (typeof bottomNavItems)[number];
  active: boolean;
}) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'nav-active' : 'nav-inactive'}`}
      style={{ textDecoration: 'none', transform: active ? 'scale(1.1)' : 'scale(1)' }}
    >
      <div className={`p-2 rounded-xl ${active ? 'clay bg-white' : ''}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-center leading-tight">{item.label}</span>
    </Link>
  );
};
