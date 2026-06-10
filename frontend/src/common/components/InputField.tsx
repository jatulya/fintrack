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
    <div className="col-stack">
      {label && (
        <label htmlFor={id} className="text-label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        )}
        <input
          id={id}
          className={cn(
            'clay w-full border-none outline-none transition-all focus:ring-2 focus:ring-indigo-400',
            Icon ? 'py-3 pr-4 pl-11' : 'p-3 px-4',
            showPasswordToggle && 'pr-11',
            error && 'ring-2 ring-rose-400',
            className,
          )}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 p-1 flex items-center text-slate-400 hover:text-indigo-500 border-none bg-transparent cursor-pointer"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-error">{error}</span>}
    </div>
  );
};

export const SelectField = ({
  label,
  options,
  ...props
}: { label?: string; options: { value: string; label: string }[] } & SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <div className="col-stack">
      {label && <label className="text-label">{label}</label>}
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
