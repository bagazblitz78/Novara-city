import { cn } from '@/lib/cn';

/** Deterministic palette so the same name always gets the same colour. */
const PALETTE = ['#2f5d7c', '#4b6b3c', '#6b5b8e', '#8a5a2b', '#7a3e63', '#375a5a'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index]!;
}

const sizes = {
  sm: 'h-8 w-8 text-[0.7rem]',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-xl',
};

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-semibold text-white',
        sizes[size],
        className,
      )}
      style={{ backgroundColor: colorFor(name) }}
    >
      {initials(name)}
    </span>
  );
}
