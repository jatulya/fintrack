import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { SavingsGoal } from '../../../data/models/goals/types/goalTypes';
import { strings } from '../../../common/texts/strings';
import { AddGoalModal } from './AddGoalModal';
import { GoalProgressCard } from './GoalProgressCard';

interface SavingsGoalsPanelProps {
  goals: SavingsGoal[];
}

export const SavingsGoalsPanel: React.FC<SavingsGoalsPanelProps> = ({ goals }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="savings-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="font-semibold text-lg m-0">{strings.savingsGoalsTitle}</h3>
          <button
            type="button"
            className="clay-btn flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            {strings.savingsAddGoal}
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="text-body-muted m-0">{strings.savingsGoalsEmpty}</p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalProgressCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && <AddGoalModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};
