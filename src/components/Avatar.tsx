import { initials } from '../lib/format';

export function Avatar({
  name,
  size = 'md',
  tone = 'brand',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'blue';
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  } as const;

  const tones = {
    brand: 'bg-brand-100 text-brand-700',
    blue: 'bg-blue-100 text-blue-700',
  } as const;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizes[size]} ${tones[tone]}`}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </span>
  );
}
