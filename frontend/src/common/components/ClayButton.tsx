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
    primary: 'bg-accent text-white',
    secondary: 'bg-secondary text-error',
    danger: 'bg-error text-white',
    success: 'bg-accent text-white',
  };

  return (
    <button
      className={cn(
        'clay-btn font-semibold active:clay-pressed disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
