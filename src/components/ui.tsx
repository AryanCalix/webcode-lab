import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700 focus-visible:ring-brand-400',
  ghost: 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 focus-visible:ring-slate-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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

type BadgeTone = 'green' | 'amber' | 'blue' | 'slate';

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
