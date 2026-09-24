import React from 'react';
import { NOT_MEASURED } from '@/lib/format';

export interface KeyValueProps {
  label: string;
  value: React.ReactNode | null | undefined;
  basis?: string;
  mono?: boolean;
  className?: string;
}

export function KeyValue({
  label,
  value,
  basis,
  mono = false,
  className = '',
}: KeyValueProps) {
  const isNull = value === null || value === undefined || value === '';
  const displayValue = isNull ? NOT_MEASURED : value;

  return (
    <div className={`flex flex-col gap-0.5 py-1.5 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-[13px] leading-[18px] ${
            isNull
              ? 'text-[var(--ink-3)] italic'
              : mono
              ? 'font-mono text-[12px] font-medium text-[var(--ink)]'
              : 'font-medium text-[var(--ink)]'
          }`}
        >
          {displayValue}
        </span>
      </div>
      {basis && (
        <span className="text-[11px] leading-[14px] text-[var(--ink-3)] italic mt-0.5">
          {basis}
        </span>
      )}
    </div>
  );
}
