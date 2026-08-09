import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';
import { CustomModal } from '../../../common/components/CustomModal';
import { strings } from '../../../common/texts/strings';
import type {
  ProcessRecurringPaymentItem,
  ProcessRecurringPaymentItemStatus,
  ProcessRecurringPaymentsResult,
} from '../../../data/models/recurring/types/recurringTypes';

interface ProcessDueResultModalProps {
  result: Pick<ProcessRecurringPaymentsResult, 'processedCount' | 'createdCount' | 'items'>;
  onClose: () => void;
}

const STATUS_META: Record<
  ProcessRecurringPaymentItemStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  created: {
    label: strings.processDueCreated,
    className: 'text-increase bg-increase/15',
    Icon: CheckCircle2,
  },
  skipped: {
    label: strings.processDueSkipped,
    className: 'text-amber-300 bg-amber-400/15',
    Icon: MinusCircle,
  },
  partial: {
    label: strings.processDuePartial,
    className: 'text-amber-300 bg-amber-400/15',
    Icon: AlertTriangle,
  },
  failed: {
    label: strings.processDueFailed,
    className: 'text-decrease bg-decrease/15',
    Icon: XCircle,
  },
};

function paymentLabel(item: ProcessRecurringPaymentItem): string {
  return item.notes?.trim() || item.categoryLabel;
}

export const ProcessDueResultModal: React.FC<ProcessDueResultModalProps> = ({
  result,
  onClose,
}) => {
  const summary =
    result.processedCount === 0
      ? strings.processDueNoDue
      : `Created ${result.createdCount} transaction${result.createdCount === 1 ? '' : 's'} from ${result.processedCount} due payment${result.processedCount === 1 ? '' : 's'}.`;

  return (
    <CustomModal
      title={strings.processDueResultTitle}
      onClose={onClose}
      onPrimary={onClose}
      primaryText={strings.processDueResultDone}
      secondaryText={strings.cancel}
      className="max-w-xl"
    >
      <p className="modal-body text-sm m-0">{summary}</p>

      {result.items.length > 0 && (
        <ul className="m-0 p-0 list-none space-y-3 max-h-80 overflow-y-auto">
          {result.items.map((item) => {
            const meta = STATUS_META[item.status];
            const { Icon } = meta;
            return (
              <li
                key={item.recurringPaymentId}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white m-0 truncate">
                      {paymentLabel(item)}
                    </p>
                    <p className="text-xs modal-label m-0 mt-1">
                      {item.categoryLabel} · {item.accountName} ·{' '}
                      {item.direction === 'received' ? '+' : '-'}₹
                      {item.amount.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${meta.className}`}
                  >
                    <Icon size={12} />
                    {meta.label}
                  </span>
                </div>
                {item.reason && (
                  <p className="text-xs text-white/70 m-0 mt-2">{item.reason}</p>
                )}
                {!item.reason && item.createdCount > 0 && (
                  <p className="text-xs text-white/70 m-0 mt-2">
                    Created {item.createdCount} transaction
                    {item.createdCount === 1 ? '' : 's'}.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </CustomModal>
  );
};
