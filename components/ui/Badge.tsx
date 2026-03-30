'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'verified'
  | 'featured'
  | 'status-pending'
  | 'status-quoted'
  | 'status-accepted'
  | 'status-rejected'
  | 'status-completed';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  verified: 'bg-brand-green-light text-brand-green',
  featured: 'bg-amber/10 text-amber',
  'status-pending': 'bg-amber-100 text-amber-800',
  'status-quoted': 'bg-brand-blue-light text-brand-blue',
  'status-accepted': 'bg-brand-green-light text-brand-green',
  'status-rejected': 'bg-error-light text-error',
  'status-completed': 'bg-brand-green-light text-brand-green',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);

Badge.displayName = 'Badge';

export default Badge;
