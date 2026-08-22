import React from 'react';
import { GoalFormModal } from './GoalFormModal';

interface AddGoalModalProps {
  onClose: () => void;
}

/** @deprecated Prefer GoalFormModal; kept as a thin create wrapper. */
export const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose }) => (
  <GoalFormModal onClose={onClose} />
);
