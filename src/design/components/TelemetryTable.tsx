import React, { useState } from 'react';
import { TelemetryRow } from '@/lib/data/types';
import { NOT_MEASURED } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

export interface TelemetryTableProps {
  rows: TelemetryRow[];
  collapsedCount?: number;
  className?: string;
  sourceNote?: string;
}

export function TelemetryTable({
  rows,
  collapsedCount = 8,
  className = '',
  sourceNote,
}: TelemetryTableProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldCollapse = rows.length > collapsedCount;
  const displayedRows = shouldCollapse && !expanded
    ? rows.slice(0, collapsedCount)
    : rows;

  return (
    <div className={`flex flex-col ${className}`}>
      {sourceNote && (
        <div className="mb-2 px-3 py-2 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[12px] text-[var(--ink-2)] flex items-center gap-2">
          <span className="text-[var(--primary)] text-[14px]">ℹ</span>
          <span>{sourceNote}</span>
        </div>
      )}
      <div className="overflow-x-auto border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-[30px] border-b border-[var(--rule)] bg-[var(--surface-2)] text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
              <th className="px-3 py-1">Parameter</th>
              <th className="px-3 py-1 text-right">Value</th>
              <th className="px-3 py-1">Unit</th>
              <th className="px-3 py-1">Basis</th>
              <th className="px-3 py-1 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)]">
            {displayedRows.map((row, idx) => {
              const isNull = row.value === null || row.value === undefined;
              const displayVal = isNull ? NOT_MEASURED : row.value;
              const resultStatus = isNull
                ? 'unmeasured'
                : row.flagged
                ? 'breach'
                : 'clear';

              return (
                <tr
                  key={idx}
                  className={`h-[34px] text-[13px] transition-colors ${
                    row.flagged
                      ? 'bg-[var(--escalate-bg)] hover:bg-[var(--escalate-bg)] border-l-4 border-l-[var(--escalate)]'
                      : 'hover:bg-[var(--surface-2)] border-l-4 border-l-transparent'
                  }`}
                >
                  <td className="px-3 py-1.5 font-medium text-[var(--ink)]">
                    <div className="flex items-center gap-2">
                      <span>{row.param}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-[12px] tabular">
                    <span className={isNull ? 'text-[var(--ink-3)] italic font-sans text-[13px]' : 'text-[var(--ink)] font-semibold'}>
                      {displayVal}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-[12px] text-[var(--ink-3)]">
                    {row.unit || '—'}
                  </td>
                  <td className="px-3 py-1.5 text-[12px] text-[var(--ink-3)] max-w-[280px] truncate" title={row.basis}>
                    {row.basis || '—'}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <StatusBadge status={resultStatus} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {shouldCollapse && (
        <div className="mt-2.5 text-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] bg-[var(--primary-wash)] px-3 py-1.5 rounded-[var(--r-sm)] border border-[var(--primary)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              {expanded
                ? 'Show fewer parameters'
                : `+ ${rows.length - collapsedCount} more parameters`}
            </span>
            <span className="text-[10px]">{expanded ? '▲' : '▼'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

