import React from 'react';
import { Provenance } from '@/lib/data/types';
import { NOT_MEASURED } from '@/lib/format';

export interface MetricTileProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  delta?: {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  provenance?: Provenance;
  subtext?: string;
  size?: 'md' | 'lg';
  className?: string;
}

export function MetricTile({
  label,
  value,
  unit,
  delta,
  provenance = 'measured',
  subtext,
  size = 'md',
  className = '',
}: MetricTileProps) {
  const isNull = value === null || value === undefined;
  const displayValue = isNull ? NOT_MEASURED : String(value);

  const valueClasses =
    size === 'lg'
      ? 'text-[34px] leading-[38px] font-semibold tracking-tight'
      : 'text-[28px] leading-[32px] font-semibold tracking-tight';

  return (
    <div
      className={`p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] truncate">
          {label}
        </span>
        {provenance === 'supplied' && (
          <span
            title="Supplied by source system"
            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--ink-3)]"
          >
            Supplied
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
        <span
          className={`${valueClasses} ${isNull ? 'text-[var(--ink-3)] font-normal text-[20px]' : 'text-[var(--ink)] tabular'}`}
        >
          {displayValue}
        </span>
        {!isNull && unit && (
          <span className="text-[13px] font-medium text-[var(--ink-3)]">
            {unit}
          </span>
        )}
      </div>

      {(delta || subtext) && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--ink-3)]">
          {delta && (
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                delta.direction === 'up'
                  ? 'text-[var(--assured-ink)]'
                  : delta.direction === 'down'
                  ? 'text-[var(--escalate-ink)]'
                  : 'text-[var(--ink-2)]'
              }`}
            >
              {delta.direction === 'up' && '↑'}
              {delta.direction === 'down' && '↓'}
              <span>{delta.value}</span>
            </span>
          )}
          {delta?.label && <span>{delta.label}</span>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
}
