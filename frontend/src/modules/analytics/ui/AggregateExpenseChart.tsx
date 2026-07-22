import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ClayCard } from '../../../common/components/ClayCard';
import { colors } from '../../../common/themes/colors';
import type { ExpenseBucket } from './periodUtils';
import { formatCurrency, formatPeakLabel, type BucketGranularity } from './periodUtils';

interface AggregateExpenseChartProps {
  title: string;
  data: ExpenseBucket[];
  granularity: BucketGranularity;
}

function ExpenseTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ExpenseBucket }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const isMonthBucket = point.key.length === 7;
  return (
    <div className="analytics-chart-tooltip">
      <p className="analytics-chart-tooltip-value">{formatCurrency(point.expense)}</p>
      <p className="analytics-chart-tooltip-date">
        {point.date.toLocaleDateString(
          undefined,
          isMonthBucket
            ? { month: 'short', year: 'numeric' }
            : { month: 'short', day: 'numeric', year: 'numeric' },
        )}
      </p>
    </div>
  );
}

export const AggregateExpenseChart: React.FC<AggregateExpenseChartProps> = ({
  title,
  data,
  granularity,
}) => {
  const { total, peak } = useMemo(() => {
    let totalSum = 0;
    let peakBucket: ExpenseBucket | null = null;
    for (const bucket of data) {
      totalSum += bucket.expense;
      if (!peakBucket || bucket.expense > peakBucket.expense) {
        peakBucket = bucket;
      }
    }
    return { total: totalSum, peak: peakBucket };
  }, [data]);

  return (
    <ClayCard className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div>
          <h3 className="analytics-chart-title">{title}</h3>
          <div className="analytics-aggregate-meta">
            <p className="analytics-aggregate-total">{formatCurrency(total)}</p>
            {peak && peak.expense > 0 && (
              <p className="analytics-aggregate-peak">
                {formatPeakLabel(peak.date, granularity)}:{' '}
                <span className="text-increase">↗ {formatCurrency(peak.expense)}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-chart-body analytics-chart-body-tall">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="expenseAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<ExpenseTooltip />} cursor={{ stroke: colors.accent, strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="expense"
              stroke={colors.accent}
              strokeWidth={2.5}
              fill="url(#expenseAreaFill)"
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: colors.accent }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ClayCard>
  );
};
