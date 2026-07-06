import React from 'react';
import { Target, TrendingUp, ShieldCheck, Rocket } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { strings } from '../../../common/texts/strings';
import { useApp } from '../../../data/api/AppContext';

export const SavingsView: React.FC = () => {
  useApp();

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <GlassCard className="bg-gradient-primary text-white border-none">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="opacity-90" />
            <h3 className="font-semibold text-lg">Active Goals</h3>
          </div>
          <p className="text-3xl font-bold">3 Goals</p>
          <p className="text-sm opacity-90 mt-2">Target: ₹5,00,000</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4 text-accent">
            <TrendingUp size={24} />
            <h3 className="font-semibold text-lg">{strings.navGrowBabyGrow}</h3>
          </div>
          <p className="text-3xl font-bold">₹2,40,000</p>
          <p className="text-sm text-increase mt-2">+12.4% return (YoY)</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4 text-accent">
            <ShieldCheck size={24} />
            <h3 className="font-semibold text-lg">Safety Net</h3>
          </div>
          <p className="text-3xl font-bold">6 Months</p>
          <p className="text-sm text-body-muted mt-2">Emergency Fund coverage</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Piggy Bank Goals</h3>
            <button className="text-sm text-accent font-bold uppercase tracking-wider">New Goal</button>
          </div>
          <div className="space-y-6">
            <div className="clay p-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Emergency Fund</span>
                <span className="text-accent font-bold">85%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
                <div className="h-full bg-accent transition-all" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between text-xs text-body-muted">
                <span>₹85,000 saved</span>
                <span>Goal: ₹1,00,000</span>
              </div>
            </div>

            <div className="clay p-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">New MacBook Pro</span>
                <span className="text-accent font-bold">40%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
                <div className="h-full bg-accent transition-all" style={{ width: '40%' }} />
              </div>
              <div className="flex justify-between text-xs text-body-muted">
                <span>₹80,000 saved</span>
                <span>Goal: ₹2,00,000</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">{strings.navGrowBabyGrow} Portfolio</h3>
            <Rocket size={20} className="text-accent" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-soft flex-center font-bold">ST</div>
                <div>
                  <p className="font-medium m-0">Stocks & Equity</p>
                  <p className="text-xs text-body-muted m-0">45% of portfolio</p>
                </div>
              </div>
              <p className="font-bold">₹1,08,000</p>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-soft flex-center font-bold">MF</div>
                <div>
                  <p className="font-medium m-0">Mutual Funds</p>
                  <p className="text-xs text-body-muted m-0">30% of portfolio</p>
                </div>
              </div>
              <p className="font-bold">₹72,000</p>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-error-soft flex-center font-bold">CR</div>
                <div>
                  <p className="font-medium m-0">Crypto Assets</p>
                  <p className="text-xs text-body-muted m-0">15% of portfolio</p>
                </div>
              </div>
              <p className="font-bold">₹36,000</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
