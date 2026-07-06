import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  dark?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, dark, ...props }) => {
  return (
    <div 
      className={cn(
        dark ? 'glass-card-dark' : 'glass-card',
        'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
