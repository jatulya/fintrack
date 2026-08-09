import React, { useMemo, useState } from 'react';
import { PiggyBank, X } from 'lucide-react';
import { CustomModal } from '../../../common/components/CustomModal';
import { InputField, SelectField } from '../../../common/components/InputField';
import { useApp } from '../../../data/api/AppContext';
import { strings } from '../../../common/texts/strings';
import { formatInr } from './savingsMetrics';
import { RECURRING_FREQUENCY_LABELS } from '../../../data/models/recurring/types/recurringTypes';
import { AddRecurringPaymentModal } from '../../transactions/ui/AddRecurringPaymentModal';
import type { SavingsGoal } from '../../../data/models/goals/types/goalTypes';

interface GoalFormModalProps {
  onClose: () => void;
  goal?: SavingsGoal;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({ onClose, goal }) => {
  const {
    recurringPayments,
    transactions,
    goals,
    createGoal,
    updateGoal,
  } = useApp();

  const isEdit = Boolean(goal);

  const [name, setName] = useState(goal?.name ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [targetDate, setTargetDate] = useState(() => {
    if (goal?.targetDate) return goal.targetDate.slice(0, 10);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [targetAmount, setTargetAmount] = useState(
    goal ? String(goal.targetAmount) : '',
  );
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<string[]>(
    () => goal?.recurringPayments.map((item) => item.id) ?? [],
  );
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>(
    () => goal?.transactions.map((item) => item.id) ?? [],
  );
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takenRecurringIds = useMemo(() => {
    const taken = new Set<string>();
    for (const item of goals) {
      if (goal && item.id === goal.id) continue;
      for (const payment of item.recurringPayments) {
        taken.add(payment.id);
      }
    }
    return taken;
  }, [goals, goal]);

  const takenTransactionIds = useMemo(() => {
    const taken = new Set<string>();
    for (const item of goals) {
      if (goal && item.id === goal.id) continue;
      for (const tx of item.transactions ?? []) {
        taken.add(tx.id);
      }
    }
    return taken;
  }, [goals, goal]);

  const availableRecurrings = useMemo(
    () =>
      recurringPayments.filter(
        (payment) =>
          payment.direction === 'spent' &&
          !takenRecurringIds.has(payment.id) &&
          !selectedRecurringIds.includes(payment.id),
      ),
    [recurringPayments, takenRecurringIds, selectedRecurringIds],
  );

  const availableTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.direction === 'spent' &&
          !takenTransactionIds.has(tx.id) &&
          !selectedTransactionIds.includes(tx.id),
      ),
    [transactions, takenTransactionIds, selectedTransactionIds],
  );

  const selectedRecurrings = useMemo(() => {
    const fromApp = recurringPayments.filter((payment) =>
      selectedRecurringIds.includes(payment.id),
    );
    const foundIds = new Set(fromApp.map((item) => item.id));
    const fromGoal = (goal?.recurringPayments ?? []).filter(
      (payment) => selectedRecurringIds.includes(payment.id) && !foundIds.has(payment.id),
    );
    return [
      ...fromApp,
      ...fromGoal.map((payment) => ({
        id: payment.id,
        notes: payment.notes,
        amount: payment.amount,
        frequency: payment.frequency,
        direction: payment.direction,
        isActive: payment.isActive,
        accountName: '',
        categoryLabel: payment.notes,
      })),
    ];
  }, [recurringPayments, selectedRecurringIds, goal]);

  const selectedTransactions = useMemo(() => {
    const fromApp = transactions.filter((tx) => selectedTransactionIds.includes(tx.id));
    const foundIds = new Set(fromApp.map((item) => item.id));
    const fromGoal = (goal?.transactions ?? []).filter(
      (tx) => selectedTransactionIds.includes(tx.id) && !foundIds.has(tx.id),
    );
    return [
      ...fromApp,
      ...fromGoal.map((tx) => ({
        id: tx.id,
        notes: tx.notes,
        amount: tx.amount,
        spentAt: tx.spentAt,
        categoryLabel: tx.categoryLabel,
        direction: tx.direction,
        accountId: '',
        categoryId: '',
        affectsBalance: true,
        createdAt: '',
        updatedAt: '',
      })),
    ];
  }, [transactions, selectedTransactionIds, goal]);


  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      Number(targetAmount) > 0 &&
      Boolean(targetDate) &&
      (selectedRecurringIds.length > 0 || selectedTransactionIds.length > 0),
    [name, targetAmount, targetDate, selectedRecurringIds, selectedTransactionIds],
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        targetDate,
        targetAmount: Number(targetAmount),
        recurringPaymentIds: selectedRecurringIds,
        transactionIds: selectedTransactionIds,
      };

      if (isEdit && goal) {
        await updateGoal(goal.id, payload);
      } else {
        await createGoal(payload);
      }
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
        title={isEdit ? strings.savingsEditGoalModalTitle : strings.savingsAddGoalModalTitle}
        titleAddon={<PiggyBank size={22} className="text-accent shrink-0" />}
        onClose={onClose}
        primaryText={isSubmitting ? strings.savingsGoalSubmitting : strings.save}
        secondaryText={strings.cancel}
        onSubmit={handleSubmit}
        primaryDisabled={!canSubmit || isSubmitting || showRecurringModal}
      >
        {goal?.status === 'closed' && (
          <p className="text-sm text-white/80 m-0 -mt-1 mb-1">{strings.savingsGoalClosedHint}</p>
        )}

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
          {selectedRecurrings.length > 0 && (
            <ul className="m-0 p-0 list-none space-y-2">
              {selectedRecurrings.map((payment) => {
                const label = payment.notes.trim() || payment.categoryLabel;
                return (
                  <li
                    key={payment.id}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-accent/30"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white truncate">{label}</span>
                      <span className="block text-xs text-white/70">
                        {formatInr(payment.amount)} · {RECURRING_FREQUENCY_LABELS[payment.frequency]} ·{' '}
                        {payment.accountName}
                        {!payment.isActive ? ' · paused' : ''}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-lg border-none bg-transparent text-white/70 hover:text-white cursor-pointer"
                      aria-label={`Remove ${label}`}
                      onClick={() =>
                        setSelectedRecurringIds((prev) => prev.filter((id) => id !== payment.id))
                      }
                    >
                      <X size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {availableRecurrings.length > 0 ? (
            <SelectField
              label={undefined}
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                setSelectedRecurringIds((prev) => [...prev, id]);
              }}
              options={[
                { value: '', label: strings.savingsGoalRecurringSelect },
                ...availableRecurrings.map((payment) => ({
                  value: payment.id,
                  label: `${payment.notes.trim() || payment.categoryLabel} · ${formatInr(payment.amount)}`,
                })),
              ]}
            />
          ) : (
            <p className="text-sm text-white/80 m-0">{strings.savingsGoalRecurringEmpty}</p>
          )}

          <button
            type="button"
            className="text-sm text-accent font-semibold bg-transparent border-none cursor-pointer p-0 self-start"
            onClick={() => setShowRecurringModal(true)}
          >
            + {strings.savingsGoalRecurringCta}
          </button>
        </div>

        <div className="col-stack">
          <label className="text-label">{strings.savingsGoalTransactionsLabel}</label>
          {selectedTransactions.length > 0 && (
            <ul className="m-0 p-0 list-none space-y-2">
              {selectedTransactions.map((tx) => {
                const label = tx.notes.trim() || tx.categoryLabel;
                return (
                  <li
                    key={tx.id}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-white/10"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white truncate">{label}</span>
                      <span className="block text-xs text-white/70">
                        {formatInr(tx.amount)} · {new Date(tx.spentAt).toLocaleDateString()}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-lg border-none bg-transparent text-white/70 hover:text-white cursor-pointer"
                      aria-label={`Remove ${label}`}
                      onClick={() =>
                        setSelectedTransactionIds((prev) => prev.filter((id) => id !== tx.id))
                      }
                    >
                      <X size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {availableTransactions.length > 0 ? (
            <SelectField
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                setSelectedTransactionIds((prev) => [...prev, id]);
              }}
              options={[
                { value: '', label: strings.savingsGoalTransactionSelect },
                ...availableTransactions.map((tx) => ({
                  value: tx.id,
                  label: `${tx.notes.trim() || tx.categoryLabel} · ${formatInr(tx.amount)}`,
                })),
              ]}
            />
          ) : (
            <p className="text-sm text-white/80 m-0">{strings.savingsGoalTransactionsEmpty}</p>
          )}
        </div>

        {!canSubmit && (selectedRecurringIds.length === 0 && selectedTransactionIds.length === 0) && (
          <p className="text-sm text-white/70 m-0">{strings.savingsGoalFundingHint}</p>
        )}

        {error && <p className="text-sm text-red-300 m-0">{error}</p>}
      </CustomModal>

      {showRecurringModal && (
        <AddRecurringPaymentModal onClose={() => setShowRecurringModal(false)} />
      )}
    </>
  );
};
