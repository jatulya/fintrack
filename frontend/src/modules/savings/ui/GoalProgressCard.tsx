import React from 'react';
import type { SavingsGoal } from '../../../data/models/goals/types/goalTypes';
import { strings } from '../../../common/texts/strings';
import { formatInr } from './savingsMetrics';

interface GoalProgressCardProps {
  goal: SavingsGoal;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal }) => {
  const percent = goal.progressPercent;
  const remaining = goal.remaining;
  const monthly = goal.monthlyContribution;

  return (
    <div className="savings-goal-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-base m-0">{goal.name}</h4>
          {goal.description ? (
            <p className="text-xs text-body-muted m-0 mt-1">{goal.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {monthly > 0 && (
            <span className="savings-monthly-badge">
              +{formatInr(monthly)}
              {strings.savingsPerMonth}
            </span>
          )}
          <span className="text-accent font-bold text-sm">{percent}%</span>
        </div>
      </div>

      <div className="w-full h-2.5 bg-secondary/60 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-body-muted m-0 leading-relaxed">
        <span className="font-medium">
          {strings.savingsGoalCollected}: {formatInr(goal.currentAmount)}
        </span>
        <span className="mx-1.5 text-secondary">|</span>
        <span>
          {strings.savingsGoalToCollect}: {formatInr(remaining)}
        </span>
        <span className="mx-1.5 text-secondary">|</span>
        <span>
          {strings.savingsGoalTarget}: {formatInr(goal.targetAmount)}
        </span>
      </p>
    </div>
  );
};
