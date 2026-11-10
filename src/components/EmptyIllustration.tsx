import { BookOpen, Compass, Sparkles } from 'lucide-react';

export function EmptyIllustration({
  variant = 'modules',
  className = '',
}: {
  variant?: 'modules' | 'attendance' | 'projects' | 'search';
  className?: string;
}) {
  const Icon = variant === 'modules' ? BookOpen : variant === 'projects' ? Sparkles : Compass;

  return (
    <div className={`relative mx-auto h-28 w-40 ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-brand-100 via-amber-50 to-blue-100" />
      <div className="absolute -left-2 top-4 h-8 w-8 rounded-full bg-brand-300/60 blur-sm" />
      <div className="absolute -right-1 bottom-3 h-10 w-10 rounded-full bg-blue-300/60 blur-sm" />
      <div className="absolute inset-4 flex items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur">
        <Icon className="h-10 w-10 text-brand-500" />
      </div>
      <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow">
        ✦
      </span>
      <span className="absolute -bottom-1 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow">
        ✧
      </span>
    </div>
  );
}
