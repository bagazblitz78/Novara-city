import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant = 'neutral' | 'brand' | 'civic' | 'outline';

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-sunken text-muted border-transparent',
  brand: 'bg-brand-soft text-brand border-transparent',
  civic: 'bg-civic-soft text-civic border-transparent',
  outline: 'bg-transparent text-muted border-line-strong',
};

export function Badge({
  variant = 'neutral',
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'span'> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5',
        'text-[0.7rem] font-bold uppercase tracking-[0.1em]',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
