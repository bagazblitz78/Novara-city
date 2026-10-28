import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('rounded-lg border border-line bg-surface shadow-sm', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('border-b border-line px-6 py-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2 className={cn('font-display text-lg font-semibold', className)} {...rest}>
      {children}
    </h2>
  );
}

export function CardBody({ className, children, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('px-6 py-5', className)} {...rest}>
      {children}
    </div>
  );
}

/** Small label above a section heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{children}</p>;
}
