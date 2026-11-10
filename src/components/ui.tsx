import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { EmptyIllustration } from './EmptyIllustration';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  secondary:
    'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
  outline:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'rounded-lg px-3 py-2 text-sm',
  md: 'rounded-xl px-4 py-2.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

type BadgeTone = 'green' | 'amber' | 'blue' | 'slate' | 'red';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const badgeTones: Record<BadgeTone, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-100 text-red-800',
};

export function Badge({ children, tone = 'slate', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

interface AlertProps {
  tone: 'info' | 'error' | 'success';
  children: ReactNode;
}

const alertTones: Record<AlertProps['tone'], string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export function Alert({ tone, children }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${alertTones[tone]}`} role="alert">
      {children}
    </div>
  );
}

export const inputClassName =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50 disabled:text-slate-500';

export function LoadingState({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-sm text-slate-600">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  illustration = 'modules',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: 'modules' | 'attendance' | 'projects' | 'search';
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <EmptyIllustration variant={illustration} />
      <p className="mt-5 font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />;
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="font-semibold text-red-800">Gagal memuat data</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      ) : null}
    </div>
  );
}
