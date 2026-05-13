import React from 'react';
import { AlertCircle, BellRing, Target, TrendingDown } from 'lucide-react';
import { GlassCard } from '../../../common/widgets/GlassCard';
import { useApp } from '../../../data/api/AppContext';

export const BudgetsView: React.FC = () => {
  useApp();

  const budgets = [
    { category: 'Food & Dining', limit: 5000, spent: 3200 },
    { category: 'Transportation', limit: 2000, spent: 1850 },
    { category: 'Entertainment', limit: 3000, spent: 450 },
    { category: 'Shopping', limit: 10000, spent: 11200 },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Budgets & Alerts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {budgets.map(budget => {
            const percent = (budget.spent / budget.limit) * 100;
            const isOver = percent >= 100;
            const isWarning = percent >= 80 && percent < 100;

            return (
              <GlassCard key={budget.category} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isOver ? 'bg-rose-100 text-rose-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Target size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{budget.category}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 m-0">Limit: ₹{budget.limit.toLocaleString()}</p>
                    <p className={`font-bold m-0 ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>Spent: ₹{budget.spent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all ${isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min(100, percent)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{Math.round(percent)}% Consumed</span>
                  {isOver && (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-500 uppercase">
                      <AlertCircle size={14} /> Over Budget by ₹{(budget.spent - budget.limit).toLocaleString()}
                    </span>
                  )}
                  {isWarning && !isOver && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 uppercase">
                      <BellRing size={14} /> 80% Threshold Reached
                    </span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className="space-y-6">
          <GlassCard className="bg-amber-50 border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <BellRing size={18} /> Smart Nudge
            </h4>
            <p className="text-sm text-amber-700">
              You've spent 60% of your <b>Dining</b> budget in the first 10 days of the month. At this rate, you'll exceed your limit by ₹2,400.
            </p>
          </GlassCard>

          <GlassCard>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-indigo-500" /> Weekly Digest
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-bold">₹20,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Spent</span>
                <span className="font-bold text-rose-600">₹16,700</span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '83%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Your spending is 15% higher than last week.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
