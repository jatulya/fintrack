import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const InputField = ({
  label,
  error,
  icon: Icon,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  id,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <div className="input-field">
      {label && (
        <label htmlFor={id}>{label}</label>
      )}
      <div className="input-field__wrapper">
        {Icon && (
          <Icon size={18} className="input-icon" />
        )}
        <input
          id={id}
          className={cn(
            'clay w-full border-none outline-none transition-all focus:ring-2 focus:ring-indigo-400',
            Icon ? 'input-with-icon' : 'p-3 px-4',
            showPasswordToggle && 'input-with-icon-toggle',
            error && 'ring-2 ring-rose-400',
            className,
          )}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="input-toggle"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
};

export const SelectField = ({
  label,
  options,
  ...props
}: { label?: string; options: { value: string; label: string }[] } & SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
      <select
        className="clay p-3 px-4 border-none outline-none focus:ring-2 focus:ring-indigo-400 transition-all appearance-none bg-white cursor-pointer w-full"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
