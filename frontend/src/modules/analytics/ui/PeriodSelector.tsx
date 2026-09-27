import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import {
  canGoToNextWeek,
  isCurrentWeek,
  maxMonthInputValue,
  maxYearValue,
  toDateInputValue,
  type PeriodPreset,
  type PeriodSelection,
} from './periodUtils';
import { CategoryFilterDropdown } from './CategoryFilterDropdown';

interface PeriodSelectorProps {
  selection: PeriodSelection;
  displayLabel: string;
  onSelectionChange: (next: PeriodSelection) => void;
  categoryOptions: string[];
  selectedLabels: Set<string>;
  setSelectedLabels: (next: Set<string>) => void;
}

const PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'monthly', label: strings.periodMonthly },
  { value: 'weekly', label: strings.periodWeekly },
  { value: 'yearly', label: strings.periodYearly },
  { value: 'custom', label: strings.periodCustom },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selection,
  displayLabel,
  onSelectionChange,
  categoryOptions,
  selectedLabels,
  setSelectedLabels,
}) => {
  const { preset } = selection;
  const nextWeekDisabled = !canGoToNextWeek(selection.weekOffset);
  const onCurrentWeek = isCurrentWeek(selection.weekOffset);
  const todayMax = toDateInputValue(new Date());

  const setPreset = (nextPreset: PeriodPreset) => {
    onSelectionChange({
      ...selection,
      preset: nextPreset,
      weekOffset: nextPreset === 'weekly' ? 0 : selection.weekOffset,
    });
  };

  return (
    <div className="analytics-period-bar">
      <div className="analytics-period-select-wrap">
        <select
          className="analytics-period-select"
          value={preset}
          onChange={(e) => setPreset(e.target.value as PeriodPreset)}
          aria-label={strings.periodLabel}
        >
          {PRESET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="analytics-period-chevron" aria-hidden="true" />
      </div>

      <div className="analytics-period-select-wrap">
        <CategoryFilterDropdown
          options={categoryOptions}
          selected={selectedLabels}
          onChange={setSelectedLabels}
        />
      </div>

      <div className="analytics-period-right">
        <p className="analytics-period-label">{displayLabel}</p>

        {preset === 'monthly' && (
          <label className="analytics-period-date-field">
            <span className="sr-only">{strings.periodMonth}</span>
            <input
              type="month"
              className="analytics-period-month-input"
              value={selection.monthValue}
              max={maxMonthInputValue()}
              onChange={(e) =>
                onSelectionChange({ ...selection, monthValue: e.target.value })
              }
            />
          </label>
        )}

        {preset === 'yearly' && (
          <label className="analytics-period-date-field">
            <span className="sr-only">{strings.periodYear}</span>
            <input
              type="number"
              className="analytics-period-year-input"
              value={selection.yearValue}
              min={2000}
              max={maxYearValue()}
              onChange={(e) => {
                const year = Number(e.target.value);
                if (!Number.isFinite(year)) return;
                onSelectionChange({
                  ...selection,
                  yearValue: Math.min(maxYearValue(), Math.max(2000, year)),
                });
              }}
            />
          </label>
        )}

        {preset === 'weekly' && (
          <div className="analytics-week-nav">
            <button
              type="button"
              className="analytics-week-btn"
              onClick={() =>
                onSelectionChange({ ...selection, weekOffset: selection.weekOffset - 1 })
              }
              aria-label={strings.periodPreviousWeek}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="analytics-week-btn analytics-week-btn-current"
              disabled={onCurrentWeek}
              onClick={() => onSelectionChange({ ...selection, weekOffset: 0 })}
            >
              {strings.periodCurrentWeek}
            </button>
            <button
              type="button"
              className="analytics-week-btn"
              disabled={nextWeekDisabled}
              onClick={() =>
                onSelectionChange({ ...selection, weekOffset: selection.weekOffset + 1 })
              }
              aria-label={strings.periodNextWeek}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {preset === 'custom' && (
          <div className="analytics-period-custom">
            <label className="analytics-period-date-field">
              <span>{strings.periodFrom}</span>
              <input
                type="date"
                value={selection.customStart}
                max={selection.customEnd || todayMax}
                onChange={(e) =>
                  onSelectionChange({ ...selection, customStart: e.target.value })
                }
              />
            </label>
            <label className="analytics-period-date-field">
              <span>{strings.periodTo}</span>
              <input
                type="date"
                value={selection.customEnd}
                max={todayMax}
                onChange={(e) =>
                  onSelectionChange({ ...selection, customEnd: e.target.value })
                }
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
