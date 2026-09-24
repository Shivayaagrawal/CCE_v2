'use client';

import React from 'react';
import { DecisionRecord } from '@/lib/data/types';
import { StatusBadge } from '@/design/components/StatusBadge';
import {
  formatPercent,
  formatCount,
  formatLatency,
  formatDateTime,
} from '@/lib/format';

export interface DecisionHeaderProps {
  record: DecisionRecord;
  className?: string;
}

export function DecisionHeader({ record, className = '' }: DecisionHeaderProps) {
  return (
    <header
      className={`h-[78px] shrink-0 sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--rule)] shadow-[var(--e1)] px-3 sm:px-4 flex items-center justify-between gap-2 xl:gap-3 select-none ${className}`}
      aria-label="Decision Record Header Strip"
    >
      {/* 10 Metadata Fields Container */}
      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 flex-wrap sm:flex-nowrap">
        {/* Field 1: Decision ID */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Decision ID
          </span>
          <span className="font-mono text-[11.5px] font-bold text-[var(--ink)]">
            {record.id}
          </span>
        </div>

        {/* Field 2: Timestamp */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Timestamp (UTC)
          </span>
          <span className={`text-[11.5px] font-medium tabular ${!record.timestampUtc ? 'text-[var(--ink-3)] italic' : 'text-[var(--ink)]'}`}>
            {formatDateTime(record.timestampUtc)}
          </span>
        </div>

        {/* Field 3: Battery ID */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Battery ID
          </span>
          <span className="font-mono text-[11.5px] font-semibold text-[var(--ink)]">
            {record.batteryId}
          </span>
        </div>

        {/* Field 4: Previous Battery ID */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Prev Battery
          </span>
          <span className={`font-mono text-[11.5px] ${!record.previousBatteryId ? 'text-[var(--ink-3)] italic' : 'font-semibold text-[var(--ink)]'}`}>
            {record.previousBatteryId ?? 'Not measured'}
          </span>
        </div>

        {/* Field 5: Vehicle ID */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Vehicle ID
          </span>
          <span className="font-mono text-[11.5px] font-semibold text-[var(--ink)]">
            {record.vehicleId}
          </span>
        </div>

        {/* Field 6: Manufacturer */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Manufacturer
          </span>
          <span className="text-[11.5px] font-medium text-[var(--ink)]">
            {record.manufacturer}
          </span>
        </div>

        {/* Field 7: Pack Config */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Pack Config
          </span>
          <span className="font-mono text-[11.5px] font-medium text-[var(--ink)]">
            {record.packConfiguration}
          </span>
        </div>

        {/* Field 8: SoH & Status */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            SoH & Status
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[11.5px] font-bold tabular text-[var(--ink)]">
              {formatPercent(record.soh.value)}
            </span>
            <span className="text-[9px] font-semibold px-1 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--rule)] text-[var(--ink-2)] whitespace-nowrap">
              {record.sohStatus}
            </span>
          </div>
        </div>

        {/* Field 9: Cycle Count */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Cycles
          </span>
          <span className="text-[11.5px] font-medium tabular text-[var(--ink)]">
            {formatCount(record.cycleCount.value)}
          </span>
        </div>

        {/* Field 10: Pipeline Latency */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[9px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
            Latency
          </span>
          <span className="text-[11.5px] font-mono tabular text-[var(--ink-2)]">
            {formatLatency(record.pipelineLatencySeconds.value)}
          </span>
        </div>
      </div>

      {/* Field 11: Overall Assurance Outcome */}
      <div className="flex items-center shrink-0 pl-2 sm:pl-3 border-l border-[var(--rule)]">
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[8.5px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Overall Outcome
          </span>
          <StatusBadge outcome={record.outcome} size="sm" />
        </div>
      </div>
    </header>
  );
}
