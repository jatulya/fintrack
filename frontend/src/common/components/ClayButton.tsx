import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  className,
  variant = 'primary',
  ...props
}) => {
  const variantStyles = {
    primary: 'clay-btn',
    secondary: 'glass-btn glass-btn-ghost',
    danger: 'clay-btn',
    success: 'clay-btn',
  };

  return (
    <button
      className={cn(
        variantStyles[variant],
        'font-semibold active:clay-pressed disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
