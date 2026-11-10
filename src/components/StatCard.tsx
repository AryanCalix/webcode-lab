import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { AnimatedNumber } from './AnimatedNumber';

const tones = {
  orange: 'bg-brand-100 text-brand-700',
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  violet: 'bg-violet-100 text-violet-700',
} as const;

function renderValue(value: ReactNode): ReactNode {
  if (typeof value === 'number') {
    return <AnimatedNumber value={value} />;
  }

  if (typeof value === 'string') {
    const match = /^(\d+)(%?)$/.exec(value.trim());
    if (match) {
      return <AnimatedNumber value={Number(match[1])} suffix={match[2]} />;
    }
  }

  return value;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'orange',
  action,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  action?: ReactNode;
}) {
  return (
    <div className="hover-lift group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-200/50 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {renderValue(value)}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
