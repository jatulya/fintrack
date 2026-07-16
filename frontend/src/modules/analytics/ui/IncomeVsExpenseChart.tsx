import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ClayCard } from '../../../common/components/ClayCard';
import { strings } from '../../../common/texts/strings';
import { colors } from '../../../common/themes/colors';
import type { IncomeExpenseBucket } from './periodUtils';
import { formatCurrency } from './periodUtils';

interface IncomeVsExpenseChartProps {
  data: IncomeExpenseBucket[];
}

function BarsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="analytics-chart-tooltip">
      <p className="analytics-chart-tooltip-value">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="analytics-chart-tooltip-date" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ data }) => {
  return (
    <ClayCard className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">{strings.incomeVsExpense}</h3>
      </div>

      {data.every((d) => d.income === 0 && d.expense === 0) ? (
        <p className="analytics-empty">{strings.noExpenseData}</p>
      ) : (
        <div className="analytics-chart-body analytics-chart-body-tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(154, 132, 158, 0.2)" />
              <XAxis
                dataKey="label"
                tick={{ fill: colors.textMuted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: colors.textMuted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
              />
              <Tooltip content={<BarsTooltip />} cursor={{ fill: 'rgba(228, 103, 172, 0.08)' }} />
              <Legend />
              <Bar
                dataKey="income"
                name={strings.income}
                fill={colors.accent}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name={strings.expense}
                fill={colors.error}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ClayCard>
  );
};
