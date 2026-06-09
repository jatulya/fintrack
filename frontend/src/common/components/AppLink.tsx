import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AppLinkVariant = 'primary' | 'subtle';

interface AppLinkProps extends LinkProps {
  variant?: AppLinkVariant;
  children: ReactNode;
}

const variantStyles: Record<AppLinkVariant, string> = {
  primary: 'text-indigo-500 font-semibold underline underline-offset-2 hover:text-indigo-600',
  subtle: 'text-slate-500 font-medium hover:text-indigo-500 hover:underline',
};

export function AppLink({ variant = 'primary', className, children, ...props }: AppLinkProps) {
  return (
    <Link className={cn(variantStyles[variant], 'transition-colors', className)} {...props}>
      {children}
    </Link>
  );
}
