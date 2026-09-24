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

  // Tri-state sorting: null means unsorted (default natural order)
  const [sortState, setSortState] = useState<{ col: SortColumn; dir: SortDirection } | null>({
    col: 'timestampUtc',
    dir: 'desc',
  });

  const handleSort = (col: SortColumn) => {
    setPage(1);
    if (!sortState || sortState.col !== col) {
      setSortState({ col, dir: 'asc' });
    } else if (sortState.dir === 'asc') {
      setSortState({ col, dir: 'desc' });
    } else {
      // Third click -> unsorted
      setSortState(null);
    }
  };

  const sortedEvents = React.useMemo(() => {
    if (!sortState) {
      return events;
    }
    const { col, dir } = sortState;
    return [...events].sort((a, b) => {
      let aVal: any = a[col];
      let bVal: any = b[col];

      if (col === 'timestampUtc') {
        aVal = new Date(a.timestampUtc).getTime();
        bVal = new Date(b.timestampUtc).getTime();
      }

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const cmp = aVal > bVal ? 1 : -1;
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [events, sortState]);

  const totalPages = Math.ceil(sortedEvents.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRowClick = (event: DecisionEvent) => {
    if (event.hasFullRecord) {
      router.push(`/decisions/${event.id}/input`);
    }
  };

  // Generate numbered pages list (up to 5 surrounding current page)
  const getNumberedPages = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }
    return pages;
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
          8 rows / page · {sortState ? `Sorted by ${sortState.col} (${sortState.dir})` : 'Unsorted'}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-[32px] border-b border-[var(--rule)] bg-[var(--surface-2)] text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] select-none">
              <th className="px-3 py-1 font-semibold">Decision ID</th>
              <th
                className="px-3 py-1 font-semibold cursor-pointer hover:text-[var(--ink)] transition-colors"
                onClick={() => handleSort('timestampUtc')}
                title="Click to sort (asc → desc → unsorted)"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Timestamp</span>
                  <span className={`text-[11px] font-bold ${sortState?.col === 'timestampUtc' ? 'text-[var(--primary)]' : 'text-[var(--ink-4)]'}`}>
                    {sortState?.col === 'timestampUtc' ? (sortState.dir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </div>
              </th>
              <th className="px-3 py-1 font-semibold">Battery ID</th>
              <th className="px-3 py-1 font-semibold">Vehicle ID</th>
              <th
                className="px-3 py-1 font-semibold text-right cursor-pointer hover:text-[var(--ink)] transition-colors"
                onClick={() => handleSort('sohPct')}
                title="Click to sort (asc → desc → unsorted)"
              >
                <div className="inline-flex items-center gap-1.5 justify-end">
                  <span>SoH %</span>
                  <span className={`text-[11px] font-bold ${sortState?.col === 'sohPct' ? 'text-[var(--primary)]' : 'text-[var(--ink-4)]'}`}>
                    {sortState?.col === 'sohPct' ? (sortState.dir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </div>
              </th>
              <th className="px-3 py-1 font-semibold">Engine Action</th>
              <th
                className="px-3 py-1 font-semibold text-right cursor-pointer hover:text-[var(--ink)] transition-colors"
                onClick={() => handleSort('outcome')}
                title="Click to sort (asc → desc → unsorted)"
              >
                <div className="inline-flex items-center gap-1.5 justify-end">
                  <span>Assurance Outcome</span>
                  <span className={`text-[11px] font-bold ${sortState?.col === 'outcome' ? 'text-[var(--primary)]' : 'text-[var(--ink-4)]'}`}>
                    {sortState?.col === 'outcome' ? (sortState.dir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </div>
              </th>
              <th className="px-3 py-1 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)]">
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[12px] text-[var(--ink-3)] italic">
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
                    className={`h-[36px] text-[13px] transition-colors ${
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
                          className="text-[var(--primary)] hover:underline flex items-center gap-1.5 group-hover:text-[var(--primary-hover)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{event.id}</span>
                          <span className="text-[11px] text-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                            →
                          </span>
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
                          className="text-[11px] font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] bg-[var(--primary-wash)] px-2 py-0.5 rounded border border-[var(--primary)] transition-colors inline-flex items-center gap-1 group-hover:shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View Details</span>
                          <span className="transition-transform group-hover:translate-x-0.5">›</span>
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

      {/* Pagination Controls (§12: first/prev/numbered/next/last, local state) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-[12px] text-[var(--ink-3)] px-1 pt-1 flex-wrap gap-2">
          <div>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedEvents.length)} of {sortedEvents.length} events
          </div>

          <div className="flex items-center gap-1">
            {/* First */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              className="px-2 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              First
            </button>

            {/* Prev */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Prev
            </button>

            {/* Numbered Page Buttons */}
            {getNumberedPages().map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`min-w-[28px] h-7 px-2 rounded-[var(--r-sm)] text-[11px] font-semibold tabular transition-colors ${
                    isCurrent
                      ? 'bg-[var(--primary)] text-white font-bold border border-[var(--primary)]'
                      : 'bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--rule)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Next
            </button>

            {/* Last */}
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
