import React from 'react';
import { Outcome } from '@/lib/data/types';
import { StatusBadge, StatusIcon } from './StatusBadge';

export interface OutcomeCardProps {
  outcome: Outcome;
  action: string;
  size?: 'rail' | 'display';
  className?: string;
}

const outcomeMeta: Record<
  Outcome,
  { label: string; bg: string; border: string; ink: string; mark: string }
> = {
  ASSURED: {
    label: 'Assured',
    bg: 'var(--assured-bg)',
    border: 'var(--assured-border)',
    ink: 'var(--assured-ink)',
    mark: 'var(--assured)',
  },
  'ASSURED WITH LIMITATIONS': {
    label: 'Assured with limitations',
    bg: 'var(--limitation-bg)',
    border: 'var(--limitation-border)',
    ink: 'var(--limitation-ink)',
    mark: 'var(--limitation)',
  },
  'REVIEW REQUIRED': {
    label: 'Review required',
    bg: 'var(--review-bg)',
    border: 'var(--review-border)',
    ink: 'var(--review-ink)',
    mark: 'var(--review)',
  },
  ESCALATE: {
    label: 'Escalate',
    bg: 'var(--escalate-bg)',
    border: 'var(--escalate-border)',
    ink: 'var(--escalate-ink)',
    mark: 'var(--escalate)',
  },
};

export function OutcomeCard({
  outcome,
  action,
  size = 'display',
  className = '',
}: OutcomeCardProps) {
  const meta = outcomeMeta[outcome];

  if (size === 'rail') {
    return (
      <div
        className={`p-2.5 rounded-[var(--r-md)] border flex flex-col gap-1 ${className}`}
        style={{
          backgroundColor: meta.bg,
          borderColor: meta.border,
          color: meta.ink,
        }}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <StatusIcon status={outcome} className="w-3.5 h-3.5 shrink-0" />
          <span>{meta.label}</span>
        </div>
        <div className="text-[12px] font-medium leading-tight text-[var(--ink)]">
          {action}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-[var(--r-lg)] border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[var(--e1)] ${className}`}
      style={{
        backgroundColor: meta.bg,
        borderColor: meta.border,
      }}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div
          className="w-10 h-10 rounded-[var(--r-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: meta.bg, color: meta.mark, border: `1px solid ${meta.border}` }}
        >
          <StatusIcon status={outcome} className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Overall Assurance Outcome
          </div>
          <div
            className="text-[18px] font-semibold leading-tight mt-0.5"
            style={{ color: meta.ink }}
          >
            {meta.label}
          </div>
        </div>
      </div>

      <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--rule)]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">
          Recommended Action
        </div>
        <div className="text-[13px] font-semibold text-[var(--ink)] mt-0.5">
          {action}
        </div>
      </div>
    </div>
  );
}
