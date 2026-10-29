'use client';

import { useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type FieldProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  /** Inline validation message, wired via aria-describedby + aria-invalid. */
  error?: string;
  hint?: string;
};

/**
 * Labelled text input with accessible error/hint wiring.
 *
 * The server is the source of truth for validation; this component just renders
 * whatever message the form passes down and links it to the input for screen
 * readers.
 */
export function Field({ label, error, hint, className, id, required, ...rest }: FieldProps) {
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
          'focus:border-focus focus:outline-none',
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
