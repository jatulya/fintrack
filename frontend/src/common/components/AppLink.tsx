import { Link, type LinkProps } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AppLinkProps extends LinkProps {
  variant?: 'primary' | 'subtle';
}

const variantStyles = {
  primary: 'text-accent font-semibold underline underline-offset-2 hover:opacity-80',
  subtle: 'text-body-muted font-medium hover:text-accent hover:underline',
};

export function AppLink({ variant = 'primary', className, ...props }: AppLinkProps) {
  return <Link className={cn(variantStyles[variant], className)} {...props} />;
}
