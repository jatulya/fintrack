import React from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { colors } from '../../../common/themes/colors';
import { strings } from '../../../common/texts/strings';
import type { TrajectoryPoint } from './savingsDemoData';
import { formatInr } from './savingsMetrics';

interface SavingsTrajectoryChartProps {
  data: TrajectoryPoint[];
  projectedCompletion: string;
}

function TrajectoryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number | null }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const actual = payload.find((p) => p.dataKey === 'actual')?.value;
  const projected = payload.find((p) => p.dataKey === 'projected')?.value;
  const value = actual ?? projected;
  if (value == null) return null;

  return (
    <div className="analytics-chart-tooltip">
      <p className="analytics-chart-tooltip-value">{formatInr(value)}</p>
      <p className="analytics-chart-tooltip-date">
        {label}
        {actual == null && projected != null ? ' · projected' : ''}
      </p>
    </div>
  );
}

export const SavingsTrajectoryChart: React.FC<SavingsTrajectoryChartProps> = ({
  data,
  projectedCompletion,
}) => {
  return (
    <div className="savings-panel">
      <div className="mb-4">
        <h3 className="font-semibold text-lg m-0">{strings.savingsTrajectoryTitle}</h3>
        <p className="text-sm text-body-muted m-0 mt-1">
          {strings.savingsTrajectoryCaption}:{' '}
          <span className="text-accent font-semibold">{projectedCompletion}</span>
        </p>
      </div>

      <div className="h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsAreaFill" x1="0" y1="0" x2="0" y2="1">
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
            />
            <YAxis
              tick={{ fill: colors.textMuted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            />
            <Tooltip content={<TrajectoryTooltip />} cursor={{ stroke: colors.accent, strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke={colors.accent}
              strokeWidth={2.5}
              fill="url(#savingsAreaFill)"
              connectNulls={false}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: colors.accent }}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke={colors.accent}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: colors.secondary }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
