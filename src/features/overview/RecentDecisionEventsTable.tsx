'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DecisionEvent } from '@/lib/data/types';
import { StatusBadge } from '@/design/components/StatusBadge';
import { formatPercent, formatDateTime, NOT_MEASURED } from '@/lib/format';
import { Tooltip } from '@/design/components/Tooltip';

export interface RecentDecisionEventsTableProps {
  events: DecisionEvent[];
  className?: string;
}

type SortColumn = 'timestampUtc' | 'sohPct' | 'outcome';
type SortDirection = 'asc' | 'desc';

export function RecentDecisionEventsTable({
  events,
  className = '',
}: RecentDecisionEventsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [sortColumn, setSortColumn] = useState<SortColumn>('timestampUtc');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  };

  const sortedEvents = React.useMemo(() => {
    return [...events].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (sortColumn === 'timestampUtc') {
        aVal = new Date(a.timestampUtc).getTime();
        bVal = new Date(b.timestampUtc).getTime();
      }

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const cmp = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [events, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedEvents.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRowClick = (event: DecisionEvent) => {
    if (event.hasFullRecord) {
      router.push(`/decisions/${event.id}/input`);
    }
  };

  return (
    <div className={`p-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between ${className}`}>
      {/* Table Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-semibold leading-[20px] text-[var(--ink)] tracking-tight">
            Recent Decision Events
          </h3>
          <p className="text-[12px] text-[var(--ink-3)] mt-0.5">
            Fleet events across 312 monitored assets ({events.length} total events matching criteria)
          </p>
        </div>

        <div className="text-[11px] text-[var(--ink-3)] font-mono">
          8 rows / page · 4 master demo records clickable
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-[30px] border-b border-[var(--rule)] bg-[var(--surface-2)] text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] select-none">
              <th className="px-3 py-1 font-semibold">Decision ID</th>
              <th
                className="px-3 py-1 font-semibold cursor-pointer hover:text-[var(--ink)]"
                onClick={() => handleSort('timestampUtc')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Timestamp</span>
                  <span className="text-[10px] text-[var(--primary)]">
                    {sortColumn === 'timestampUtc' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </div>
              </th>
              <th className="px-3 py-1 font-semibold">Battery ID</th>
              <th className="px-3 py-1 font-semibold">Vehicle ID</th>
              <th
                className="px-3 py-1 font-semibold text-right cursor-pointer hover:text-[var(--ink)]"
                onClick={() => handleSort('sohPct')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>SoH %</span>
                  <span className="text-[10px] text-[var(--primary)]">
                    {sortColumn === 'sohPct' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </div>
              </th>
              <th className="px-3 py-1 font-semibold">Engine Action</th>
              <th
                className="px-3 py-1 font-semibold text-right cursor-pointer hover:text-[var(--ink)]"
                onClick={() => handleSort('outcome')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Assurance Outcome</span>
                  <span className="text-[10px] text-[var(--primary)]">
                    {sortColumn === 'outcome' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </div>
              </th>
              <th className="px-3 py-1 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)]">
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-[12px] text-[var(--ink-3)] italic">
                  No decision events match the active filter criteria.
                </td>
              </tr>
            ) : (
              pagedRows.map((event) => {
                const isClickable = event.hasFullRecord;

                const rowElement = (
                  <tr
                    key={event.id}
                    onClick={() => handleRowClick(event)}
                    className={`h-[34px] text-[13px] transition-colors ${
                      isClickable
                        ? 'hover:bg-[var(--surface-2)] cursor-pointer group bg-[rgba(29,78,216,0.02)]'
                        : 'hover:bg-[var(--surface-sunken)] cursor-default'
                    }`}
                  >
                    {/* Decision ID */}
                    <td className="px-3 py-1.5 font-mono text-[12px] font-semibold">
                      {isClickable ? (
                        <Link
                          href={`/decisions/${event.id}/input`}
                          className="text-[var(--primary)] hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{event.id}</span>
                          <span className="text-[10px] opacity-75">↗</span>
                        </Link>
                      ) : (
                        <span className="text-[var(--ink)]">{event.id}</span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-3 py-1.5 text-[12px] text-[var(--ink-2)] font-mono tabular">
                      {event.timestampUtc ? formatDateTime(event.timestampUtc) : NOT_MEASURED}
                    </td>

                    {/* Battery ID */}
                    <td className="px-3 py-1.5 text-[12px] font-mono text-[var(--ink)]">
                      {event.batteryId}
                    </td>

                    {/* Vehicle ID */}
                    <td className="px-3 py-1.5 text-[12px] font-mono text-[var(--ink-2)]">
                      {event.vehicleId}
                    </td>

                    {/* SoH % */}
                    <td className="px-3 py-1.5 text-right font-mono text-[12px] font-semibold tabular text-[var(--ink)]">
                      {formatPercent(event.sohPct)}
                    </td>

                    {/* Engine Action */}
                    <td className="px-3 py-1.5 text-[12px] text-[var(--ink)] truncate max-w-[180px]" title={event.engineAction}>
                      <span className="font-mono text-[11px] text-[var(--ink-2)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">
                        {event.engineAction}
                      </span>
                    </td>

                    {/* Assurance Outcome */}
                    <td className="px-3 py-1.5 text-right">
                      <StatusBadge outcome={event.outcome} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-1.5 text-right">
                      {isClickable ? (
                        <Link
                          href={`/decisions/${event.id}/input`}
                          className="text-[11px] font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] bg-[var(--primary-wash)] px-2 py-0.5 rounded border border-[var(--primary)] transition-colors inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details →
                        </Link>
                      ) : (
                        <span className="text-[11px] text-[var(--ink-3)] select-none">
                          Archived
                        </span>
                      )}
                    </td>
                  </tr>
                );

                if (!isClickable) {
                  return (
                    <Tooltip
                      key={event.id}
                      content="Detailed assurance record not retained for this event."
                      placement="top"
                    >
                      {rowElement}
                    </Tooltip>
                  );
                }

                return rowElement;
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (§12: first, prev, numbered, next, last) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-[12px] text-[var(--ink-3)] px-1 pt-1 flex-wrap gap-2">
          <div>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedEvents.length)} of {sortedEvents.length} events
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              className="px-2 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              First
            </button>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Prev
            </button>

            <span className="px-2 py-1 text-[12px] font-medium tabular text-[var(--ink)]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              className="px-2 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
