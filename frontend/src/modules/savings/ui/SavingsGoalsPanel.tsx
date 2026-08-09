import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { SavingsGoal } from '../../../data/models/goals/types/goalTypes';
import { strings } from '../../../common/texts/strings';
import { AddGoalModal } from './AddGoalModal';
import { GoalFormModal } from './GoalFormModal';
import { GoalProgressCard } from './GoalProgressCard';

interface SavingsGoalsPanelProps {
  goals: SavingsGoal[];
}

export const SavingsGoalsPanel: React.FC<SavingsGoalsPanelProps> = ({ goals }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  return (
    <>
      <div className="savings-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="font-semibold text-lg m-0">{strings.savingsGoalsTitle}</h3>
          <button
            type="button"
            className="clay-btn flex items-center gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={20} />
            {strings.savingsAddGoal}
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="text-body-muted m-0">{strings.savingsGoalsEmpty}</p>
        ) : (
          <div className="savings-goals-list space-y-4">
            {goals.map((goal) => (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
              />
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && <AddGoalModal onClose={() => setIsCreateOpen(false)} />}
      {editingGoal && (
        <GoalFormModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </>
  );
};
