'use client';

import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DecisionRecord } from '@/lib/data/types';
import type { FleetAggregates } from '@/lib/data/types';
import { formatCount, formatPercent } from '@/lib/format';
import { ChartFrame } from '@/design/components/ChartFrame';
import { useChartTableToggle } from './useChartTableToggle';
import { useMotionMs } from '@/features/motion';

export function HistoricalPatternChart({
  record,
  fleetMeanSoh,
}: {
  record: DecisionRecord;
  fleetMeanSoh: number | null;
}) {
  const { tableView, onToggleTable } = useChartTableToggle();
  const duration = useMotionMs(320);
  const data = useMemo(
    () =>
      record.context.historyPoints.map((point) => ({
        name: point.label,
        vehicle: point.sohPct,
        fleet: fleetMeanSoh,
      })),
    [record, fleetMeanSoh]
  );

  return (
    <ChartFrame
      title="Historical pattern comparison"
      subtitle="This vehicle against the fleet mean"
      tableView={tableView}
      onToggleTable={onToggleTable}
      empty={data.length === 0}
      emptyTitle="No history points"
      emptyDetail="This record does not include comparison points."
      tableContent={
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.06em] text-[var(--ink-3)]">
              <th className="text-left">Point</th>
              <th className="text-right">Vehicle SoH</th>
              <th className="text-right">Fleet mean</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name} className="border-t border-[var(--rule)]">
                <td>{row.name}</td>
                <td className="text-right tabular">{formatPercent(row.vehicle)}</td>
                <td className="text-right tabular">{formatPercent(row.fleet)}</td>
              </tr>
            ))}
            <tr className="border-t border-[var(--rule)]">
              <td>Cycle count at assessment</td>
              <td className="text-right tabular" colSpan={2}>{formatCount(record.context.cycleCountAtAssessment)}</td>
            </tr>
          </tbody>
        </table>
      }
    >
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 36, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--grid)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#5F6C7E' }} axisLine={{ stroke: '#CDD5DF' }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#5F6C7E' }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="vehicle" name="This vehicle" fill="#2A78D6" radius={[0, 4, 4, 0]} barSize={10} isAnimationActive={duration > 0} animationDuration={duration}>
              <LabelList dataKey="vehicle" position="right" formatter={(value: number) => formatPercent(value)} style={{ fontSize: 10, fill: '#0F1B2D' }} />
            </Bar>
            <Bar dataKey="fleet" name="Fleet mean" fill="#EB6834" radius={[0, 4, 4, 0]} barSize={10} isAnimationActive={duration > 0} animationDuration={duration}>
              <LabelList dataKey="fleet" position="right" formatter={(value: number) => formatPercent(value)} style={{ fontSize: 10, fill: '#0F1B2D' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 text-[11px] text-[var(--ink-2)] mt-2">
        <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-[#2A78D6]" /> This vehicle</span>
        <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-[#EB6834]" /> Fleet mean</span>
      </div>
    </ChartFrame>
  );
}
