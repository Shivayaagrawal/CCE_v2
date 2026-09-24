'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DecisionEvent } from '@/lib/data/types';
import { getVehicleHistory } from '@/lib/data';
import { formatDateTime, formatPercent } from '@/lib/format';
import { Panel } from '@/design/components/Panel';
import { StatusBadge } from '@/design/components/StatusBadge';
import { engineActionLabel } from '@/features/labels';

export function HistoricalEventsTable({ vehicleId, currentId }: { vehicleId: string; currentId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<DecisionEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    getVehicleHistory(vehicleId).then((events) => {
      if (!cancelled) setRows(events.slice(0, 8));
    });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return (
    <Panel title="Historical events" subtitle="This vehicle" dense className="h-full overflow-hidden">
      <div className="overflow-auto max-h-[180px] border border-[var(--rule)] rounded-[var(--r-sm)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-[30px] bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
              <th className="px-2">Decision</th>
              <th className="px-2">Timestamp</th>
              <th className="px-2 text-right">SoH</th>
              <th className="px-2">Action</th>
              <th className="px-2">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const clickable = row.hasFullRecord;
              return (
                <tr
                  key={row.id}
                  title={clickable ? undefined : 'Detailed assurance record not retained for this event.'}
                  onClick={() => {
                    if (clickable) router.push(`/decisions/${row.id}/input`);
                  }}
                  className={`h-[34px] text-[12px] border-t border-[var(--rule)] ${
                    row.id === currentId ? 'bg-[var(--primary-wash)]' : ''
                  } ${clickable ? 'cursor-pointer hover:bg-[var(--surface-2)]' : 'cursor-default'}`}
                >
                  <td className="px-2 font-mono text-[11px]">{row.id}</td>
                  <td className="px-2 text-[var(--ink-2)]">{formatDateTime(row.timestampUtc)}</td>
                  <td className="px-2 text-right tabular">{formatPercent(row.sohPct)}</td>
                  <td className="px-2">{engineActionLabel(row.engineAction)}</td>
                  <td className="px-2">
                    <StatusBadge outcome={row.outcome} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
