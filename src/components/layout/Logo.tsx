import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-8 w-8 shrink-0" focusable="false">
        <rect width="64" height="64" rx="14" fill="var(--brand)" />
        <path d="M18 46V18h8l12 16V18h8v28h-8L26 30v16z" fill="#fff" />
        <path d="M18 50h28v3H18z" fill="#fff" opacity=".55" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">Novara City</span>
    </span>
  );
}
