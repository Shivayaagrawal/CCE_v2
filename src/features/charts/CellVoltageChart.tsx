'use client';

import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TelemetryRow } from '@/lib/data/types';
import { formatVoltage } from '@/lib/format';
import { ChartFrame } from '@/design/components/ChartFrame';
import { EmptyState } from '@/design/components/EmptyState';
import { useChartTableToggle } from './useChartTableToggle';
import { SEQ_BAR } from './palette';
import { useMotionMs } from '@/features/motion';

function cellRows(rows: TelemetryRow[]) {
  return rows
    .filter((row) => /^Cell \d{2} Voltage$/.test(row.param))
    .map((row) => ({
      cell: row.param.replace(' Voltage', ''),
      volts: row.value == null ? null : Number(row.value),
    }))
    .filter((row) => row.volts != null && !Number.isNaN(row.volts));
}

export function CellVoltageChart({ rows }: { rows: TelemetryRow[] }) {
  const { tableView, onToggleTable } = useChartTableToggle();
  const duration = useMotionMs(320);
  const cells = useMemo(() => cellRows(rows), [rows]);
  const imbalance = rows.find((row) => row.param === 'Cell Imbalance (std)');

  if (cells.length === 0) {
    return (
      <ChartFrame title="Cell voltage distribution" onToggleTable={undefined} empty emptyTitle="Cell-level telemetry not supplied for this record." emptyDetail="The source did not include the 14 cell voltages.">
        <EmptyState title="Cell-level telemetry not supplied for this record." detail="The source did not include the 14 cell voltages." />
      </ChartFrame>
    );
  }

  const values = cells.map((cell) => cell.volts as number);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  return (
    <ChartFrame
      title="Cell voltage distribution"
      subtitle={imbalance?.value ? `σ ${imbalance.value} V against 50 mV AIS-038 limit` : 'Valid band 2.50–4.20 V'}
      tableView={tableView}
      onToggleTable={onToggleTable}
      tableContent={
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.06em] text-[var(--ink-3)]">
              <th className="text-left">Cell</th>
              <th className="text-right">Voltage</th>
            </tr>
          </thead>
          <tbody>
            {cells.map((cell) => (
              <tr key={cell.cell} className="border-t border-[var(--rule)]">
                <td>{cell.cell}</td>
                <td className="text-right tabular">{formatVoltage(cell.volts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cells} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="cell" tick={{ fontSize: 9, fill: '#5F6C7E' }} interval={0} tickLine={false} axisLine={{ stroke: '#CDD5DF' }} />
            <YAxis domain={[2.5, 4.2]} tick={{ fontSize: 10, fill: '#5F6C7E' }} width={36} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => formatVoltage(Number(value))} />
            <ReferenceLine y={mean} stroke="#1D4ED8" strokeDasharray="3 3" />
            <Bar dataKey="volts" radius={[4, 4, 0, 0]} isAnimationActive={duration > 0} animationDuration={duration}>
              {cells.map((cell, index) => {
                const volts = cell.volts as number;
                const outside = volts < 2.5 || volts > 4.2;
                return <Cell key={cell.cell} fill={outside ? '#FF1F1F' : SEQ_BAR[index] ?? '#2A78D6'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
