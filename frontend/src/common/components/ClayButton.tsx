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
    primary: 'bg-indigo-500 text-white',
    secondary: 'bg-purple-500 text-white',
    danger: 'bg-rose-500 text-white',
    success: 'bg-emerald-500 text-white',
  };

  return (
    <button 
      className={cn(
        'clay-btn font-semibold active:clay-pressed disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
