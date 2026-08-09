import React from 'react';
import { Pencil } from 'lucide-react';
import type { SavingsGoal } from '../../../data/models/goals/types/goalTypes';
import { strings } from '../../../common/texts/strings';
import { formatInr } from './savingsMetrics';

interface GoalProgressCardProps {
  goal: SavingsGoal;
  onEdit?: () => void;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal, onEdit }) => {
  const percent = goal.progressPercent;
  const remaining = goal.remaining;
  const monthly = goal.monthlyContribution;
  const isClosed = (goal.status ?? 'active') === 'closed';

  return (
    <div className={`savings-goal-card ${isClosed ? 'savings-goal-card-muted' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-base m-0">{goal.name}</h4>
            {isClosed && (
              <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-500">
                {strings.savingsGoalStatusClosed}
              </span>
            )}
          </div>
          {goal.description ? (
            <p className="text-xs text-body-muted m-0 mt-1">{goal.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {monthly > 0 && !isClosed && (
            <span className="savings-monthly-badge">
              +{formatInr(monthly)}
              {strings.savingsPerMonth}
            </span>
          )}
          <span className="text-accent font-bold text-sm">{percent}%</span>
          {onEdit && (
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-accent transition-colors border-none bg-transparent cursor-pointer"
              aria-label={`${strings.savingsEditGoal}: ${goal.name}`}
              onClick={onEdit}
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-2.5 bg-secondary/60 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isClosed ? 'bg-slate-400' : 'bg-accent'}`}
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
