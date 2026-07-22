import React from 'react';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ClayButton } from './ClayButton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Accepts sync/async handlers with any argument list. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalAction = (...args: any[]) => any;

export interface CustomModalProps {
  title: React.ReactNode;
  children: React.ReactNode;
  onClose: ModalAction;
  primaryText: string;
  secondaryText?: string;
  onPrimary?: ModalAction;
  onSecondary?: ModalAction;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  /**
   * When provided, body + footer are wrapped in a `<form>` and the primary
   * button becomes `type="submit"`. Use this for form-based modals.
   */
  onSubmit?: ModalAction;
  /** Extra classes on the GlassCard (e.g. max-w-4xl). Defaults to max-w-lg. */
  className?: string;
  /** Optional content rendered before the title (e.g. an icon). */
  titleAddon?: React.ReactNode;
  stickyHeader?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  title,
  children,
  onClose,
  primaryText,
  secondaryText = 'Cancel',
  onPrimary,
  onSecondary,
  primaryDisabled = false,
  secondaryDisabled = false,
  onSubmit,
  className,
  titleAddon,
  stickyHeader = false,
}) => {
  const handleSecondary = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onSecondary) {
      void onSecondary(event);
      return;
    }
    void onClose(event);
  };

  const handlePrimary = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onPrimary) {
      void onPrimary(event);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) {
      void onSubmit(event);
    }
  };

  const footer = (
    <div className="flex gap-4 pt-4">
      <ClayButton
        type="button"
        variant="secondary"
        onClick={handleSecondary}
        disabled={secondaryDisabled}
        className="flex-1 bg-white/10 text-white"
      >
        {secondaryText}
      </ClayButton>
      <ClayButton
        type={onSubmit ? 'submit' : 'button'}
        variant="primary"
        className="flex-1"
        disabled={primaryDisabled}
        onClick={onSubmit ? undefined : handlePrimary}
      >
        {primaryText}
      </ClayButton>
    </div>
  );

  const body = (
    <>
      {children}
      {footer}
    </>
  );

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-[100] flex-center p-4"
      style={{ backgroundColor: 'rgba(31, 3, 34, 0.4)' }}
    >
      <GlassCard
        className={cn('w-full max-w-lg p-0 overflow-hidden animate-fade-in', className)}
        dark
      >
        <div
          className={cn(
            'p-6 border-b border-white/10 flex justify-between items-center bg-white/5',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {titleAddon}
            <h2 className="text-xl font-bold text-white m-0 truncate">{title}</h2>
          </div>
          <button
            type="button"
            onClick={(event) => void onClose(event)}
            className="modal-label hover:text-white transition-colors border-none bg-transparent cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {body}
          </form>
        ) : (
          <div className="p-6 space-y-6">{body}</div>
        )}
      </GlassCard>
    </div>
  );
};
