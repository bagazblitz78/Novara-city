import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

/** Loading placeholder. Always pair with an `aria-busy` region in usage. */
export function Skeleton({ className, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-sunken', className)}
      {...rest}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg',
        'border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-full bg-sunken font-display text-lg text-muted"
      >
        —
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action}
    </div>
  );
}
