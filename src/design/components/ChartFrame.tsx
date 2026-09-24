import React from 'react';
import { Panel } from './Panel';
import { EmptyState } from './EmptyState';

export interface ChartFrameProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  legend?: React.ReactNode;
  tableView?: boolean;
  onToggleTable?: () => void;
  empty?: boolean;
  emptyTitle?: string;
  emptyDetail?: string;
  actions?: React.ReactNode;
  className?: string;
  tableContent?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartFrame({
  title,
  subtitle,
  legend,
  tableView = false,
  onToggleTable,
  empty = false,
  emptyTitle = 'No telemetry data',
  emptyDetail = 'Detailed records are not available for this event.',
  actions,
  className = '',
  tableContent,
  children,
}: ChartFrameProps) {
  return (
    <Panel
      title={title}
      subtitle={subtitle}
      tableView={tableView}
      onToggleTable={onToggleTable}
      actions={actions}
      className={className}
    >
      {legend && <div className="mb-3">{legend}</div>}

      {empty ? (
        <EmptyState title={emptyTitle} detail={emptyDetail} />
      ) : tableView ? (
        <div className="overflow-x-auto min-h-[160px] flex flex-col justify-center">
          {tableContent || (
            <div className="text-[12px] text-[var(--ink-3)] text-center py-6 italic">
              Table view data representation
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full min-h-[160px]">{children}</div>
      )}
    </Panel>
  );
}
