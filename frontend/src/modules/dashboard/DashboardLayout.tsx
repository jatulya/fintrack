import { LayoutDashboard, Wallet, Plus, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useLocation, Routes, Route, Navigate, Link } from 'react-router-dom';
import { GlassCard } from '../../common/components';
import { strings } from '../../common/texts/strings';
import { AccountsView } from '../accounts/ui/AccountsView';
import { AnalyticsView } from '../analytics/ui/AnalyticsView';
import { useAuth } from '../auth';
import { CategoriesView } from '../categories/ui/CategoriesView';
import { SavingsView } from '../savings/ui/SavingsView';
import { AddTransactionModal } from '../transactions/ui/AddTransactionModal';
import { TransactionsView } from '../transactions/ui/TransactionsView';
import Dashboard from './Dashboard';
import { Sidebar } from './Sidebar';

const DashboardLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar onQuickAdd={() => setIsAddModalOpen(true)} onLogout={handleLogout} />

      <main className="flex-1 page-container pb-24 lg:pb-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<AccountsView />} />
          <Route path="categories" element={<CategoriesView />} />
          <Route path="transactions" element={<TransactionsView />} />
          <Route path="savings" element={<SavingsView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <nav className="bottom-nav lg:hidden">
        <GlassCard className="p-2 px-6 flex justify-between items-center rounded-3xl">
          <NavItem to="/dashboard" icon={LayoutDashboard} label={strings.navCozyCorner} active={location.pathname === '/dashboard'} />
          <NavItem to="/dashboard/accounts" icon={Wallet} label={strings.navStashes} active={location.pathname === '/dashboard/accounts'} />
          <div className="mb-8">
            <div className="fab" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={32} />
            </div>
          </div>
          <NavItem to="/dashboard/transactions" icon={ArrowLeftRight} label={strings.navMoneyDiary} active={location.pathname === '/dashboard/transactions'} />
          <NavItem to="/dashboard/savings" icon={TrendingUp} label={strings.navPiggyBank} active={location.pathname === '/dashboard/savings'} />
        </GlassCard>
      </nav>

      {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

export default DashboardLayout;

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: React.ComponentType<{ size?: number }>; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'nav-active' : 'nav-inactive'}`}
    style={{ textDecoration: 'none', transform: active ? 'scale(1.1)' : 'scale(1)' }}
  >
    <div className={`p-2 rounded-xl ${active ? 'clay bg-white' : ''}`}>
      <Icon size={24} />
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-center leading-tight">{label}</span>
  </Link>
);
