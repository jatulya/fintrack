import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { GlassCard } from '../../../common/components/GlassCard';
import { strings } from '../../../common/texts/strings';
import { colors } from '../../../common/themes/colors';
import { useApp } from '../../../data/api/AppContext';

export const AnalyticsView: React.FC = () => {
  const { transactions } = useApp();

  const categoryDataMap = transactions
    .filter((t) => t.direction === 'spent')
    .reduce((acc, t) => {
      acc[t.categoryLabel] = (acc[t.categoryLabel] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

  const monthlyDataMap = transactions.reduce((acc, t) => {
    const month = t.spentAt.substring(0, 7);
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (t.direction === 'received') acc[month].income += t.amount;
    if (t.direction === 'spent') acc[month].expense += t.amount;
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));

  const CHART_COLORS = [colors.accent, colors.secondary, colors.error, '#c9a0b8', '#f0b8d0', '#d484ad'];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <GlassCard>
          <h3 className="font-semibold text-lg mb-6">{strings.spendingByCategory}</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-lg mb-6">{strings.incomeVsExpense}</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill={colors.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill={colors.error} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mb-8">
        <h3 className="font-semibold text-lg mb-6">{strings.savingsTrend}</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={(d) => d.income - d.expense}
                name="Net Savings"
                stroke={colors.accent}
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};
