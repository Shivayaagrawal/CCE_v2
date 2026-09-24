'use client';

import React from 'react';
import type { TelemetryRow } from '@/lib/data/types';
import { formatTemperature } from '@/lib/format';
import { ChartFrame } from '@/design/components/ChartFrame';
import { useChartTableToggle } from './useChartTableToggle';

const MIN_ENV = -20;
const MAX_ENV = 60;

function readTemp(rows: TelemetryRow[], param: string): number | null {
  const row = rows.find((item) => item.param === param);
  if (!row || row.value == null) return null;
  const value = Number(row.value);
  return Number.isNaN(value) ? null : value;
}

function position(value: number): string {
  const pct = ((value - MIN_ENV) / (MAX_ENV - MIN_ENV)) * 100;
  return `${Math.min(100, Math.max(0, pct))}%`;
}

export function TemperatureSpread({ rows }: { rows: TelemetryRow[] }) {
  const { tableView, onToggleTable } = useChartTableToggle();
  const min = readTemp(rows, 'Min Cell Temperature');
  const max = readTemp(rows, 'Max Cell Temperature');
  const sensors = [1, 2, 3]
    .map((index) => ({ label: `Sensor ${index}`, value: readTemp(rows, `Cell Temp 0${index}`) }))
    .filter((sensor) => sensor.value != null) as { label: string; value: number }[];

  if (min == null || max == null) {
    return (
      <ChartFrame title="Temperature spread" empty emptyTitle="Temperature not supplied" emptyDetail="Min and max cell temperature were not in this record.">
        <span />
      </ChartFrame>
    );
  }

  const outside = (value: number) => value < MIN_ENV || value > MAX_ENV;

  return (
    <ChartFrame
      title="Temperature spread"
      subtitle="Envelope −20 to +60 °C"
      tableView={tableView}
      onToggleTable={onToggleTable}
      tableContent={
        <table className="w-full text-[12px]">
          <tbody>
            <tr><td>Minimum</td><td className="text-right tabular">{formatTemperature(min)}</td></tr>
            <tr><td>Maximum</td><td className="text-right tabular">{formatTemperature(max)}</td></tr>
            {sensors.map((sensor) => (
              <tr key={sensor.label}>
                <td>{sensor.label}</td>
                <td className="text-right tabular">{formatTemperature(sensor.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="relative h-16 mt-6" role="img" aria-label="Temperature spread across the discharge envelope">
        <div className="absolute left-0 right-0 top-6 h-2 rounded-full bg-[var(--seq-200)]" />
        <div
          className="absolute top-6 h-2 bg-[var(--seq-500)]"
          style={{ left: position(min), width: `calc(${position(max)} - ${position(min)})` }}
        />
        {[{ label: 'Min', value: min }, { label: 'Max', value: max }, ...sensors].map((mark) => (
          <div key={mark.label} className="absolute top-3" style={{ left: position(mark.value) }}>
            <div className="w-2 h-2 rounded-full -translate-x-1/2" style={{ background: outside(mark.value) ? '#FF1F1F' : '#1D4ED8' }} />
            <div className="text-[10px] text-[var(--ink)] -translate-x-1/2 mt-3 whitespace-nowrap">{mark.label} {formatTemperature(mark.value)}</div>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
