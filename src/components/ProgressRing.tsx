import type { CSSProperties } from 'react';
import { AnimatedNumber } from './AnimatedNumber';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
  strokeClassName?: string;
}

export function ProgressRing({
  value,
  size = 72,
  strokeWidth = 8,
  className = '',
  labelClassName = '',
  showLabel = true,
  strokeClassName = 'stroke-brand-500',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const ringStyle = {
    strokeDasharray: circumference,
    strokeDashoffset: offset,
    '--ring-from': circumference,
    '--ring-to': offset,
  } as CSSProperties;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={ringStyle}
          className={`ring-progress transition-all duration-700 ${strokeClassName}`}
        />
      </svg>
      {showLabel ? (
        <span
          className={`absolute text-sm font-bold text-slate-900 ${labelClassName}`}
        >
          <AnimatedNumber value={clamped} suffix="%" />
        </span>
      ) : null}
    </div>
  );
}
