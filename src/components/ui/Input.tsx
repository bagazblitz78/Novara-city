'use client';

import { useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  /** Always required — accessible forms never ship unlabelled fields. */
  label: string;
  /** Inline validation message, wired to the input via aria-describedby. */
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className, id, required, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-brand">
            *
          </span>
        ) : null}
      </label>

      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          'h-11 w-full rounded-md border bg-surface px-3.5 text-[0.95rem] text-ink',
          'placeholder:text-muted/70 transition-colors',
          'focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          error ? 'border-danger' : 'border-line-strong',
          className,
        )}
        {...rest}
      />

      {error || hint ? (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cn('text-xs', error ? 'font-semibold text-danger' : 'text-muted')}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
