'use client';

import React, { useState } from 'react';
import type { DecisionRecord, Outcome } from '@/lib/data/types';
import { formatCount, formatDateTime, formatPercent, NOT_MEASURED } from '@/lib/format';
import { StatusBadge } from '@/design/components/StatusBadge';
import { engineActionLabel, sohStatusLabel } from '@/features/labels';

const TONE: Record<Outcome, { bg: string; border: string }> = {
  ASSURED: { bg: 'var(--surface)', border: 'var(--rule)' },
  'ASSURED WITH LIMITATIONS': { bg: 'var(--limitation-bg)', border: 'var(--limitation-border)' },
  'REVIEW REQUIRED': { bg: 'var(--review-bg)', border: 'var(--review-border)' },
  ESCALATE: { bg: 'var(--escalate-bg)', border: 'var(--escalate-border)' },
};

export function DecisionHeader({ record }: { record: DecisionRecord }) {
  const [open, setOpen] = useState(false);
  const tone = TONE[record.outcome];
  const primary = [
    { label: 'Decision', value: record.id, mono: true },
    { label: 'Vehicle', value: record.vehicleId, mono: true },
    { label: 'Battery', value: record.batteryId, mono: true },
    { label: 'SoH', value: `${formatPercent(record.soh.value)} · ${sohStatusLabel(record.sohStatus)}` },
    { label: 'Engine action', value: engineActionLabel(record.engineAction) },
    { label: 'Timestamp', value: formatDateTime(record.timestampUtc) },
  ];

  return (
    <header
      className="rounded-[var(--r-md)] border px-3 py-2.5"
      style={{ background: tone.bg, borderColor: tone.border }}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {primary.map((field) => (
          <div key={field.label} className="min-w-[88px]">
            <div className="text-[12px] font-semibold text-[var(--ink-3)] leading-[14px]">{field.label}</div>
            <div className={`text-[13px] leading-[18px] text-[var(--ink)] mt-0.5 ${field.mono ? 'font-mono' : 'font-medium'}`}>
              {field.value}
            </div>
          </div>
        ))}
        <div className="ml-auto">
          <StatusBadge outcome={record.outcome} size="md" />
        </div>
      </div>
      <button
        type="button"
        className="mt-2 text-[12px] font-semibold text-[var(--ink-2)]"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Hide asset details' : 'Asset details'}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--ink)]">
          <span>Manufacturer {record.manufacturer}</span>
          <span>Pack {record.packConfiguration}</span>
          <span>Cycles {record.cycleCount.value == null ? NOT_MEASURED : formatCount(record.cycleCount.value)}</span>
        </div>
      )}
    </header>
  );
}
