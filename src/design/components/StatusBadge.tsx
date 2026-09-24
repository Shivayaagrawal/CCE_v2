import React from 'react';
import { LayerResult, Outcome } from '@/lib/data/types';

export type StatusValue = LayerResult | Outcome;

export interface StatusBadgeProps {
  result?: LayerResult;
  outcome?: Outcome;
  status?: StatusValue;
  size?: 'sm' | 'md';
  className?: string;
}

// Icons specified in SPEC.md §7.2:
// assured: check in circle
// limitation: half-filled circle
// review: triangle with bar
// escalate: triangle with exclamation
// unmeasured: dash in circle

export function StatusIcon({ status, className = 'w-3 h-3' }: { status: StatusValue; className?: string }) {
  const norm = normalizeStatus(status);
  switch (norm) {
    case 'assured':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8.2L7 10.2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'limitation':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1A7 7 0 0 1 8 15V1Z" fill="currentColor" />
        </svg>
      );
    case 'review':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6.5 11.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'escalate':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 5.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
      );
    case 'unmeasured':
    default:
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

function normalizeStatus(status: StatusValue): 'assured' | 'limitation' | 'review' | 'escalate' | 'unmeasured' {
  switch (status) {
    case 'ASSURED':
    case 'clear':
      return 'assured';
    case 'ASSURED WITH LIMITATIONS':
    case 'limitation':
      return 'limitation';
    case 'REVIEW REQUIRED':
    case 'review':
      return 'review';
    case 'ESCALATE':
    case 'breach':
      return 'escalate';
    case 'unmeasured':
    default:
      return 'unmeasured';
  }
}

function getStatusLabel(status: StatusValue): string {
  switch (status) {
    case 'ASSURED':
      return 'Assured';
    case 'ASSURED WITH LIMITATIONS':
      return 'Assured with limitations';
    case 'REVIEW REQUIRED':
      return 'Review required';
    case 'ESCALATE':
      return 'Escalate';
    case 'clear':
      return 'Clear';
    case 'limitation':
      return 'Limitation';
    case 'review':
      return 'Review';
    case 'breach':
      return 'Breach';
    case 'unmeasured':
    default:
      return 'Not measured';
  }
}

const statusStyles: Record<
  'assured' | 'limitation' | 'review' | 'escalate' | 'unmeasured',
  { bg: string; border: string; ink: string }
> = {
  assured: {
    bg: 'var(--assured-bg)',
    border: 'var(--assured-border)',
    ink: 'var(--assured-ink)',
  },
  limitation: {
    bg: 'var(--limitation-bg)',
    border: 'var(--limitation-border)',
    ink: 'var(--limitation-ink)',
  },
  review: {
    bg: 'var(--review-bg)',
    border: 'var(--review-border)',
    ink: 'var(--review-ink)',
  },
  escalate: {
    bg: 'var(--escalate-bg)',
    border: 'var(--escalate-border)',
    ink: 'var(--escalate-ink)',
  },
  unmeasured: {
    bg: 'var(--unmeasured-bg)',
    border: 'var(--unmeasured-border)',
    ink: 'var(--unmeasured-ink)',
  },
};

export function StatusBadge({ result, outcome, status, size = 'md', className = '' }: StatusBadgeProps) {
  const value: StatusValue = result ?? outcome ?? status ?? 'unmeasured';
  const norm = normalizeStatus(value);
  const label = getStatusLabel(value);
  const style = statusStyles[norm];

  const sizeClasses = size === 'sm'
    ? 'text-[10px] leading-[13px] px-1.5 py-0.5 gap-1'
    : 'text-[11px] leading-[14px] px-2 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-[var(--r-sm)] border shrink-0 transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.ink,
      }}
    >
      <StatusIcon status={value} className={iconSize} />
      <span>{label}</span>
    </span>
  );
}
