import { PieChart, Plus, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../common/components';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { paths } from '../../common/routes/paths';
import { strings } from '../../common/texts/strings';
import { useApp } from '../../data/api/AppContext';
import { AddTransactionModal } from '../transactions/ui/AddTransactionModal';
import { DashboardStashesRow } from './DashboardStashesRow';
import { TotalBalanceBanner } from './TotalBalanceBanner';

const Dashboard = () => {
  const { transactions } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <TotalBalanceBanner />
      <DashboardStashesRow />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{strings.recentTransactions}</h3>
            <Link to={paths.transactions} className="text-sm text-accent font-medium no-underline hover:underline">
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 clay">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex-center ${t.direction === 'received' ? 'bg-accent-soft' : 'bg-error-soft'}`}
                    >
                      {t.direction === 'received' ? <TrendingUp size={24} /> : <PieChart size={24} />}
                    </div>
                    <div>
                      <p className="font-semibold m-0">{t.notes || t.categoryLabel}</p>
                      <p className="text-xs text-body-muted m-0">
                        {t.categoryLabel} • {new Date(t.spentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold m-0 ${t.direction === 'received' ? 'text-increase' : 'text-decrease'}`}>
                    {t.direction === 'received' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-body-muted py-8">No entries yet</p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-lg mb-4">{strings.finScore}</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 flex-center">
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="364.4"
                  strokeDashoffset="72.8"
                  className="text-accent transition-all"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-3xl font-bold">80</span>
                <span className="text-xs text-body-muted uppercase tracking-widest font-bold">Health</span>
              </div>
            </div>
            <p className="text-center text-sm text-body-muted mt-4 px-4">
              Great job! Your piggy bank is looking lovely this month.
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

export default Dashboard;
