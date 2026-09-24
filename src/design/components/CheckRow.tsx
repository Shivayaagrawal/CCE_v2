import React from 'react';
import { Check } from '@/lib/data/types';
import { StatusBadge } from './StatusBadge';

export interface CheckRowProps {
  check: Check;
  className?: string;
}

export function CheckRow({ check, className = '' }: CheckRowProps) {
  return (
    <div
      className={`py-2.5 px-3 rounded-[var(--r-sm)] border border-transparent hover:border-[var(--rule)] hover:bg-[var(--surface-2)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-semibold text-[var(--ink-2)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded-[var(--r-sm)]">
            {check.id}
          </span>
          <span className="text-[13px] font-semibold text-[var(--ink)]">
            {check.label}
          </span>
        </div>

        <p className="text-[12px] leading-[16px] text-[var(--ink-3)] mt-0.5 line-clamp-2">
          {check.evaluates}
        </p>

        {check.finding && (
          <div className="mt-1.5 text-[12px] leading-[16px] font-medium text-[var(--escalate-ink)] bg-[var(--escalate-bg)] border border-[var(--escalate-border)] px-2 py-1 rounded-[var(--r-sm)] max-w-xl">
            Finding: {check.finding}
          </div>
        )}
      </div>

      <div className="shrink-0 self-start sm:self-center">
        <StatusBadge status={check.result} size="sm" />
      </div>
    </div>
  );
}
