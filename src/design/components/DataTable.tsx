import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField?: keyof T | ((row: T) => string);
  sortable?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  isRowClickable?: (row: T) => boolean;
  rowDisabledTooltip?: string;
  emptyTitle?: string;
  emptyDetail?: string;
  className?: string;
  fixedLayout?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  keyField = 'id' as keyof T,
  sortable = true,
  page = 1,
  pageSize = 8,
  total,
  onPageChange,
  onRowClick,
  isRowClickable = (row) => row.hasFullRecord ?? true,
  rowDisabledTooltip = 'Detailed assurance record not retained for this event.',
  emptyTitle = 'No records found',
  emptyDetail = 'No events match the selected criteria.',
  className = '',
  fixedLayout = false,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (colKey: string) => {
    if (!sortable) return;
    if (sortColumn === colKey) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colKey);
      setSortDirection('desc');
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortColumn) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortColumn, sortDirection]);

  // Client-side slicing if onPageChange is not controlling parent pagination
  const totalCount = total !== undefined ? total : sortedRows.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const displayedRows = onPageChange
    ? sortedRows
    : sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const getRowKey = (row: T, index: number): string => {
    if (typeof keyField === 'function') return keyField(row);
    return row[keyField] ? String(row[keyField]) : String(index);
  };

  if (rows.length === 0) {
    return (
      <div className={`p-8 text-center text-[var(--ink-3)] bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--rule)] ${className}`}>
        <div className="text-[13px] font-semibold text-[var(--ink)]">{emptyTitle}</div>
        <div className="text-[12px] mt-1">{emptyDetail}</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-w-0 ${className}`}>
      <div className="overflow-x-auto border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)]">
        <table className={`w-full text-left border-collapse ${fixedLayout ? 'table-fixed' : ''}`}>
          <thead>
            <tr className="h-[30px] border-b border-[var(--rule)] bg-[var(--surface-2)] text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] select-none">
              {columns.map((col) => {
                const isSortActive = sortColumn === col.key;
                const canSort = sortable && col.sortable !== false;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-2 py-1 font-semibold ${fixedLayout ? 'overflow-hidden whitespace-normal leading-[13px]' : 'whitespace-nowrap'} ${alignClass} ${
                      canSort ? 'cursor-pointer hover:text-[var(--ink)]' : ''
                    }`}
                    onClick={() => canSort && handleSort(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      {canSort && (
                        <span className={`w-3 text-[10px] ${isSortActive ? 'text-[var(--primary)]' : 'text-[var(--ink-3)] opacity-40'}`}>
                          {isSortActive ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)]">
            {displayedRows.map((row, idx) => {
              const clickable = onRowClick && isRowClickable(row);
              const key = getRowKey(row, idx);

              return (
                <tr
                  key={key}
                  title={!clickable && onRowClick ? rowDisabledTooltip : undefined}
                  onClick={() => clickable && onRowClick(row)}
                  className={`h-[34px] text-[13px] transition-colors ${
                    clickable
                      ? 'hover:bg-[var(--surface-2)] cursor-pointer group'
                      : 'hover:bg-[var(--surface-sunken)] cursor-default'
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    return (
                      <td key={col.key} className={`px-2 py-1.5 ${fixedLayout ? 'overflow-hidden' : 'whitespace-nowrap'} ${alignClass}`}>
                        {col.render ? col.render(row, idx) : row[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-[12px] text-[var(--ink-3)] px-1">
          <div>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Previous
            </button>
            <span className="px-2 py-1 text-[12px] font-medium tabular">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
