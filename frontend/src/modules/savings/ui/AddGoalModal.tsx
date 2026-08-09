import React, { useMemo, useState } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import { CustomModal } from '../../../common/components/CustomModal';
import { InputField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { strings } from '../../../common/texts/strings';
import { formatInr } from './savingsMetrics';
import { RECURRING_FREQUENCY_LABELS } from '../../../data/models/recurring/types/recurringTypes';
import { AddRecurringPaymentModal } from '../../transactions/ui/AddRecurringPaymentModal';

interface AddGoalModalProps {
  onClose: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose }) => {
  const { recurringPayments, createGoal } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<string[]>([]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      Number(targetAmount) > 0 &&
      Boolean(targetDate) &&
      selectedRecurringIds.length > 0,
    [name, targetAmount, targetDate, selectedRecurringIds],
  );

  const toggleRecurring = (id: string) => {
    setSelectedRecurringIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createGoal({
        name: name.trim(),
        description: description.trim() || undefined,
        targetDate,
        targetAmount: Number(targetAmount),
        recurringPaymentIds: selectedRecurringIds,
      });
      onClose();
    } catch {
      setError(strings.savingsGoalError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CustomModal
        title={strings.savingsAddGoalModalTitle}
        titleAddon={<PiggyBank size={22} className="text-accent shrink-0" />}
        onClose={onClose}
        primaryText={isSubmitting ? strings.savingsGoalSubmitting : strings.save}
        secondaryText={strings.cancel}
        onSubmit={handleSubmit}
        primaryDisabled={!canSubmit || isSubmitting || showRecurringModal}
      >
        <InputField
          id="goal-name"
          label={strings.savingsGoalNameLabel}
          placeholder={strings.savingsGoalNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <InputField
          id="goal-description"
          label={strings.savingsGoalDescriptionLabel}
          placeholder={strings.savingsGoalDescriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <InputField
          id="goal-date"
          label={strings.savingsGoalDateLabel}
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
        />
        <InputField
          id="goal-target"
          label={strings.savingsGoalTargetLabel}
          type="number"
          min={1}
          placeholder="100000"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
        />

        <div className="col-stack">
          <label className="text-label">{strings.savingsGoalRecurringLabel}</label>
          {recurringPayments.length === 0 ? (
            <div className="rounded-2xl bg-white/10 p-4 space-y-3">
              <p className="text-sm text-white/80 m-0">{strings.savingsGoalRecurringEmpty}</p>
              <button
                type="button"
                className="clay-btn flex items-center gap-2"
                onClick={() => setShowRecurringModal(true)}
              >
                <Plus size={18} />
                {strings.savingsGoalRecurringCta}
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recurringPayments.map((payment) => {
                const checked = selectedRecurringIds.includes(payment.id);
                const label = payment.notes.trim() || payment.categoryLabel;
                return (
                  <label
                    key={payment.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                      checked ? 'bg-accent/30' : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--accent)]"
                      checked={checked}
                      onChange={() => toggleRecurring(payment.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white truncate">{label}</span>
                      <span className="block text-xs text-white/70">
                        {formatInr(payment.amount)} · {RECURRING_FREQUENCY_LABELS[payment.frequency]} ·{' '}
                        {payment.accountName}
                      </span>
                    </span>
                  </label>
                );
              })}
              <button
                type="button"
                className="text-sm text-accent font-semibold bg-transparent border-none cursor-pointer p-0"
                onClick={() => setShowRecurringModal(true)}
              >
                + {strings.savingsGoalRecurringCta}
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-300 m-0">{error}</p>}
      </CustomModal>

      {showRecurringModal && (
        <AddRecurringPaymentModal onClose={() => setShowRecurringModal(false)} />
      )}
    </>
  );
};
