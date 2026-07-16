import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ClayCard: React.FC<ClayCardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('clay-card', className)} {...props}>
      {children}
    </div>
  );
};
