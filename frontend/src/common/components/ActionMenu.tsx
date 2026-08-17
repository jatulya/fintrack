import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MoreVertical, type LucideIcon } from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  ariaLabel: string;
  items: ActionMenuItem[];
  align?: 'left' | 'right';
  trigger?: ReactNode;
}

export const ActionMenu = ({
  ariaLabel,
  items,
  align = 'right',
  trigger,
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        type="button"
        className="icon-action-btn"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        {trigger ?? <MoreVertical size={16} strokeWidth={2.25} />}
      </button>

      {open && (
        <div
          id={menuId}
          className={`action-menu-dropdown ${align === 'left' ? 'action-menu-dropdown-left' : ''}`}
          role="menu"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={`action-menu-item${item.danger ? ' action-menu-item-danger' : ''}`}
                disabled={item.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                  item.onClick();
                }}
              >
                {Icon ? <Icon size={14} /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
