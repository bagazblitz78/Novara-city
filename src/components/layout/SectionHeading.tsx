import { cn } from '@/lib/cn';
import { Eyebrow } from '@/components/ui/Card';

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'start',
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: 'start' | 'center';
  className?: string;
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
      {lede ? <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lede}</p> : null}
    </div>
  );
}
