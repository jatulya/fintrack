import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Check, ChevronDown } from 'lucide-react';
import { ClayCard } from '../../../common/components/ClayCard';
import { strings } from '../../../common/texts/strings';
import { colors } from '../../../common/themes/colors';
import { formatCurrency } from './periodUtils';

const CHART_COLORS = [
  colors.accent,
  colors.secondary,
  colors.error,
  '#c9a0b8',
  '#f0b8d0',
  '#d484ad',
  '#9a849e',
];

interface CategoryDatum {
  name: string;
  value: number;
}

interface ExpenseCategoryChartProps {
  data: CategoryDatum[];
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CategoryDatum & { percent: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="analytics-chart-tooltip">
      <p className="analytics-chart-tooltip-value">{item.name}</p>
      <p className="analytics-chart-tooltip-date">
        {formatCurrency(item.value)} · {item.percent}%
      </p>
    </div>
  );
}

export const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({ data }) => {
  const allNames = useMemo(() => data.map((d) => d.name), [data]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allNames));
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(new Set(data.map((d) => d.name)));
  }, [data]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const chartData = useMemo(() => {
    const filtered = data.filter((d) => selected.has(d.name));
    const total = filtered.reduce((sum, d) => sum + d.value, 0);
    return filtered.map((d, index) => ({
      ...d,
      percent: total > 0 ? Math.round((d.value / total) * 100) : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data, selected]);

  const allSelected = allNames.length > 0 && allNames.every((name) => selected.has(name));
  const dropdownLabel = allSelected
    ? strings.allCategories
    : selected.size === 0
      ? strings.noCategoriesSelected
      : `${selected.size} ${strings.categoriesSelected}`;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allNames));
  };

  const toggleCategory = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <ClayCard className="analytics-chart-card">
      <div className="analytics-chart-header analytics-chart-header-split">
        <h3 className="analytics-chart-title">{strings.expenseCategorization}</h3>
        <div className="analytics-category-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="analytics-category-trigger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span>{dropdownLabel}</span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <div className="analytics-category-menu" role="listbox" aria-multiselectable="true">
              <button
                type="button"
                className="analytics-category-option"
                onClick={toggleAll}
                role="option"
                aria-selected={allSelected}
              >
                <span className={`analytics-category-check ${allSelected ? 'is-checked' : ''}`}>
                  {allSelected && <Check size={12} />}
                </span>
                {strings.allCategories}
              </button>
              {data.map((item) => {
                const isChecked = selected.has(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    className="analytics-category-option"
                    onClick={() => toggleCategory(item.name)}
                    role="option"
                    aria-selected={isChecked}
                  >
                    <span className={`analytics-category-check ${isChecked ? 'is-checked' : ''}`}>
                      {isChecked && <Check size={12} />}
                    </span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="analytics-empty">{strings.noExpenseData}</p>
      ) : (
        <div className="analytics-category-layout">
          <div className="analytics-chart-body analytics-donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="analytics-category-legend">
            {chartData.map((item) => (
              <li key={item.name} className="analytics-category-legend-item">
                <span
                  className="analytics-category-swatch"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <div className="analytics-category-legend-copy">
                  <div className="analytics-category-legend-row">
                    <span className="analytics-category-name">{item.name}</span>
                    <span className="analytics-category-value">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="analytics-category-bar-track">
                    <div
                      className="analytics-category-bar-fill"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="analytics-category-percent">{item.percent}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ClayCard>
  );
};
