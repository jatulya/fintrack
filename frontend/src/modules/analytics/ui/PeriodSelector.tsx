import React from 'react';
import { ChevronDown } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import type { PeriodPreset } from './periodUtils';

interface PeriodSelectorProps {
  preset: PeriodPreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: PeriodPreset) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}

const PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'monthly', label: strings.periodMonthly },
  { value: 'weekly', label: strings.periodWeekly },
  { value: 'yearly', label: strings.periodYearly },
  { value: 'custom', label: strings.periodCustom },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
}) => {
  return (
    <div className="analytics-period-bar">
      <div className="analytics-period-select-wrap">
        <select
          className="analytics-period-select"
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as PeriodPreset)}
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

      {preset === 'custom' && (
        <div className="analytics-period-custom">
          <label className="analytics-period-date-field">
            <span>{strings.periodFrom}</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
            />
          </label>
          <label className="analytics-period-date-field">
            <span>{strings.periodTo}</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
};
