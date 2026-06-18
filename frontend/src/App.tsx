import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  PieChart,
  Settings,
  Bell,
  Plus,
  LogOut,
  Tag,
} from 'lucide-react';
import { GlassCard } from './common/components/GlassCard';
import { strings } from './common/texts/strings';
import { AppProvider, useApp } from './data/api/AppContext';
import { AddTransactionModal } from './modules/transactions/ui/AddTransactionModal';
import { TransactionsView } from './modules/transactions/ui/TransactionsView';
import { CategoriesView } from './modules/categories/ui/CategoriesView';
import { AnalyticsView } from './modules/analytics/ui/AnalyticsView';
import { SavingsView } from './modules/savings/ui/SavingsView';
import { AccountsView } from './modules/accounts/ui/AccountsView';
import { LoginView } from './modules/auth/ui/LoginView';
import { RegisterView } from './modules/auth/ui/SignUpView';
import { ProtectedRoute, GuestRoute } from './modules/auth/ui/ProtectedRoute';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';

const Dashboard = () => {
  const { accounts, transactions } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.amount, 0);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{strings.appTitle}</h1>
        <div className="flex gap-4">
          <GlassCard className="p-2 px-4 flex items-center gap-2 cursor-pointer hover-scale">
            <Bell size={20} className="text-slate-600" />
            <span className="text-sm font-medium">Alerts</span>
          </GlassCard>
          <div className="w-10 h-10 rounded-full clay flex-center cursor-pointer">
            <Settings size={20} className="text-slate-600" />
          </div>
        </div>
      </div>

      <div className="grid-auto-fit mb-8">
        <GlassCard className="bg-gradient-primary text-white border-none shadow-xl">
          <p className="text-indigo-100 mb-1">{strings.totalNetWorth}</p>
          <h2 className="text-4xl font-bold">₹{totalNetWorth.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2 text-indigo-100 text-sm">
            <TrendingUp size={16} />
            <span>+5.2% from last month</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{strings.accounts}</h3>
            <Plus size={20} className="text-indigo-500 cursor-pointer" />
          </div>
          <div className="flex flex-col gap-3">
            {accounts.map(account => (
              <div key={account.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex-center bg-indigo-50 text-indigo-600">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="font-medium m-0">{account.name}</p>
                    {account.notes && <p className="text-xs text-slate-500 m-0">{account.notes}</p>}
                  </div>
                </div>
                <p className="font-semibold m-0">₹{account.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <GlassCard className="lg-col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{strings.recentTransactions}</h3>
            <Link to="/dashboard/transactions" className="text-sm text-indigo-500 font-medium no-underline hover:underline">View All</Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentTransactions.length > 0 ? recentTransactions.map(t => (
              <div key={t.id} className="flex justify-between items-center p-4 clay">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex-center ${t.direction === 'received' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.direction === 'received' ? <TrendingUp size={24} /> : <PieChart size={24} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 m-0">{t.notes || t.categoryLabel}</p>
                    <p className="text-xs text-slate-500 m-0">{t.categoryLabel} • {new Date(t.spentAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold m-0 ${t.direction === 'received' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.direction === 'received' ? '+' : '-'}₹{t.amount.toLocaleString()}
                </p>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-8">No transactions yet</p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-lg mb-4">{strings.finScore}</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 flex-center">
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="72.8" className="text-indigo-500 transition-all" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-3xl font-bold">80</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Health</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600 mt-4 px-4">
              Great job! Your savings rate is excellent this month.
            </p>
          </div>
        </GlassCard>
      </div>

      {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fab lg:hidden"
        style={{ position: 'fixed', bottom: '100px', right: '24px', zIndex: 60 }}
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: React.ComponentType<{ size?: number }>; label: string; active: boolean }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'text-indigo-600' : 'text-slate-400'}`} style={{ textDecoration: 'none', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
    <div className={`p-2 rounded-xl ${active ? 'clay bg-white' : ''}`}>
      <Icon size={24} />
    </div>
    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
  </Link>
);

const DashboardLayout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col min-h-screen">
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
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Home" active={location.pathname === '/dashboard'} />
          <NavItem to="/dashboard/accounts" icon={Wallet} label="Vault" active={location.pathname === '/dashboard/accounts'} />
          <div className="mb-8">
            <div className="fab" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={32} />
            </div>
          </div>
          <NavItem to="/dashboard/transactions" icon={ArrowLeftRight} label="Logs" active={location.pathname === '/dashboard/transactions'} />
          <NavItem to="/dashboard/savings" icon={TrendingUp} label="Goals" active={location.pathname === '/dashboard/savings'} />
        </GlassCard>
      </nav>

      <nav className="sidebar hidden lg:flex flex-col items-center py-8 gap-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex-center text-white font-bold text-xl mb-4" title={user?.email ?? 'FinTrack'}>
          {user?.fullName?.charAt(0)?.toUpperCase() ?? 'F'}
        </div>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Home" active={location.pathname === '/dashboard'} />
        <NavItem to="/dashboard/accounts" icon={Wallet} label="Vault" active={location.pathname === '/dashboard/accounts'} />
        <NavItem to="/dashboard/categories" icon={Tag} label="Tags" active={location.pathname === '/dashboard/categories'} />
        <NavItem to="/dashboard/transactions" icon={ArrowLeftRight} label="Logs" active={location.pathname === '/dashboard/transactions'} />
        <NavItem to="/dashboard/savings" icon={TrendingUp} label="Goals" active={location.pathname === '/dashboard/savings'} />
        <NavItem to="/dashboard/analytics" icon={PieChart} label="Stats" active={location.pathname === '/dashboard/analytics'} />
        <div className="mt-auto">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex-center shadow-lg cursor-pointer hover-scale" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={24} />
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 text-slate-400 border-none bg-transparent cursor-pointer"
            title="Sign out"
          >
            <div className="p-2 rounded-xl">
              <LogOut size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </nav>

      {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<GuestRoute><LoginView /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><RegisterView /></GuestRoute>} />
    <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
