'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DecisionEvent, Outcome } from '@/lib/data/types';
import { getVehicleHistory } from '@/lib/data';
import { formatDate, formatPercent } from '@/lib/format';
import { ChartFrame } from '@/design/components/ChartFrame';
import { useChartTableToggle } from '@/features/charts/useChartTableToggle';
import { OUTCOME_FILL } from '@/features/charts/palette';
import { useMotionMs } from '@/features/motion';

export function SohTrendChart({
  vehicleId,
  outcome,
  playKey = 0,
}: {
  vehicleId: string;
  outcome: Outcome;
  playKey?: number;
}) {
  const { tableView, onToggleTable } = useChartTableToggle();
  const duration = useMotionMs(320);
  const [rows, setRows] = useState<DecisionEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVehicleHistory(vehicleId).then((events) => {
      if (!cancelled) setRows(events.slice(0, 6).reverse());
    });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const data = useMemo(
    () =>
      (rows ?? []).map((row, index) => ({
        label: formatDate(row.timestampUtc),
        soh: row.sohPct,
        id: row.id,
        last: index === (rows?.length ?? 0) - 1,
      })),
    [rows]
  );

  const lastColor = OUTCOME_FILL[outcome];

  return (
    <ChartFrame
      title="SoH trend"
      subtitle="Last 6 decisions"
      className="h-full"
      tableView={tableView}
      onToggleTable={onToggleTable}
      empty={rows !== null && data.length === 0}
      emptyTitle="No vehicle history"
      emptyDetail="No prior decisions were found for this vehicle."
      tableContent={
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.06em] text-[var(--ink-3)]">
              <th className="text-left py-1">Date</th>
              <th className="text-right">SoH</th>
              <th className="text-left pl-2">Decision</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t border-[var(--rule)]">
                <td className="py-1">{row.label}</td>
                <td className="text-right tabular">{formatPercent(row.soh)}</td>
                <td className="pl-2 font-mono text-[11px]">{row.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="h-[150px]" key={playKey}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5F6C7E' }} axisLine={{ stroke: '#CDD5DF' }} tickLine={false} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: '#5F6C7E' }} width={32} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0]?.payload as { label: string; soh: number; id: string };
                return (
                  <div className="rounded-[var(--r-sm)] bg-[var(--ink)] text-white px-2 py-1 text-[11px]">
                    <div>{point.label}</div>
                    <div className="tabular">{formatPercent(point.soh)}</div>
                    <div className="font-mono opacity-80">{point.id}</div>
                  </div>
                );
              }}
            />
            {data.length > 0 && (
              <ReferenceDot
                x={data[data.length - 1]!.label}
                y={data[data.length - 1]!.soh}
                r={5}
                fill={lastColor}
                stroke={lastColor}
              />
            )}
            <Line
              type="monotone"
              dataKey="soh"
              name="SoH"
              stroke="#1D4ED8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#1D4ED8' }}
              isAnimationActive={duration > 0}
              animationDuration={duration}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
