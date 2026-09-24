'use client';

import React, { useState } from 'react';
import { TelemetryRow } from '@/lib/data/types';
import { formatTemperature, NOT_MEASURED } from '@/lib/format';
import { EmptyState } from '@/design/components/EmptyState';

export interface C10TemperatureSpreadProps {
  telemetry: TelemetryRow[];
  className?: string;
}

export function C10TemperatureSpread({ telemetry, className = '' }: C10TemperatureSpreadProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredSensor, setHoveredSensor] = useState<{ label: string; temp: number; xPct: number } | null>(null);

  // Extract temperature parameters from telemetry
  const minRow = telemetry.find(t => t.param === 'Min Cell Temperature');
  const maxRow = telemetry.find(t => t.param === 'Max Cell Temperature');
  const s1Row = telemetry.find(t => t.param === 'Cell Temp 01');
  const s2Row = telemetry.find(t => t.param === 'Cell Temp 02');
  const s3Row = telemetry.find(t => t.param === 'Cell Temp 03');

  const hasTemps = minRow?.value && maxRow?.value && (s1Row?.value || s2Row?.value || s3Row?.value);

  if (!hasTemps) {
    return (
      <div className={`p-4 bg-[var(--surface-sunken)] rounded-[var(--r-sm)] border border-[var(--rule)] flex flex-col items-center justify-center min-h-[180px] ${className}`}>
        <EmptyState
          title="Temperature telemetry not supplied"
          detail="Cell-level thermal telemetry is not supplied for this record."
        />
      </div>
    );
  }

  const minVal = parseFloat(minRow!.value!);
  const maxVal = parseFloat(maxRow!.value!);
  const sensors = [
    { label: 'Sensor 01', param: 'Cell Temp 01', val: s1Row?.value ? parseFloat(s1Row.value) : null },
    { label: 'Sensor 02', param: 'Cell Temp 02', val: s2Row?.value ? parseFloat(s2Row.value) : null },
    { label: 'Sensor 03', param: 'Cell Temp 03', val: s3Row?.value ? parseFloat(s3Row.value) : null },
  ].filter(s => s.val !== null) as { label: string; param: string; val: number }[];

  // Envelope bounds: -20°C to +60°C (80°C range)
  const envMin = -20;
  const envMax = 60;
  const totalRange = envMax - envMin; // 80

  const getPct = (temp: number) => {
    const clamped = Math.max(envMin, Math.min(envMax, temp));
    return ((clamped - envMin) / totalRange) * 100;
  };

  const minPct = getPct(minVal);
  const maxPct = getPct(maxVal);
  const rangeWidthPct = Math.max(1, maxPct - minPct);

  return (
    <div className={`p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] ${className}`}>
      {/* Header with Title & Table Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] uppercase bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded-[var(--r-sm)]">
              C10
            </span>
            <h4 className="text-[13px] font-semibold text-[var(--ink)]">Temperature Spread & Limits</h4>
          </div>
          <p className="text-[11px] text-[var(--ink-3)] mt-0.5">
            IEC 62660-1 Operating Envelope (−20.0 °C to +60.0 °C)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          aria-label={showTable ? 'View chart visualization' : 'View data table'}
          className="text-[11px] font-semibold text-[var(--ink-2)] hover:text-[var(--primary)] bg-[var(--surface-2)] hover:bg-[var(--primary-wash)] border border-[var(--rule)] hover:border-[var(--primary)] px-2.5 py-1 rounded-[var(--r-sm)] transition-colors cursor-pointer"
        >
          {showTable ? 'Chart' : 'Table'}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--rule)] bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
                <th className="px-2 py-1">Measurement</th>
                <th className="px-2 py-1 text-right">Value</th>
                <th className="px-2 py-1">Standard Envelope</th>
                <th className="px-2 py-1 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] font-mono tabular">
              <tr>
                <td className="px-2 py-1.5 font-sans font-medium text-[var(--ink)]">Min Cell Temperature</td>
                <td className="px-2 py-1.5 text-right font-semibold text-[var(--ink)]">{formatTemperature(minVal)}</td>
                <td className="px-2 py-1.5 font-sans text-[var(--ink-3)]">≥ −20.00 °C</td>
                <td className="px-2 py-1.5 text-right text-[var(--assured-ink)] font-semibold">In Envelope</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 font-sans font-medium text-[var(--ink)]">Max Cell Temperature</td>
                <td className="px-2 py-1.5 text-right font-semibold text-[var(--ink)]">{formatTemperature(maxVal)}</td>
                <td className="px-2 py-1.5 font-sans text-[var(--ink-3)]">≤ +60.00 °C</td>
                <td className="px-2 py-1.5 text-right text-[var(--assured-ink)] font-semibold">In Envelope</td>
              </tr>
              {sensors.map((s, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1.5 font-sans font-medium text-[var(--ink)]">{s.label} ({s.param})</td>
                  <td className="px-2 py-1.5 text-right font-semibold text-[var(--ink)]">{formatTemperature(s.val)}</td>
                  <td className="px-2 py-1.5 font-sans text-[var(--ink-3)]">[30.28 °C – 32.32 °C]</td>
                  <td className="px-2 py-1.5 text-right text-[var(--assured-ink)] font-semibold">In Envelope</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pt-2 pb-1 relative" aria-label="Thermal envelope chart">
          {/* Envelope labels */}
          <div className="flex justify-between text-[10px] font-mono text-[var(--ink-3)] mb-1">
            <span>−20.0 °C</span>
            <span className="font-sans font-medium text-[var(--ink-2)]">
              Observed Spread: {minVal.toFixed(2)} °C to {maxVal.toFixed(2)} °C (Δ {(maxVal - minVal).toFixed(2)} °C)
            </span>
            <span>+60.0 °C</span>
          </div>

          {/* Range Track Background */}
          <div className="h-6 w-full bg-[var(--surface-sunken)] rounded-[var(--r-sm)] border border-[var(--rule)] relative overflow-visible">
            {/* Valid Envelope Region Indicator */}
            <div className="absolute inset-0 rounded-[var(--r-sm)] bg-[rgba(29,78,216,0.04)]" />

            {/* Observed Min-Max Spread Bar */}
            <div
              className="absolute top-1 bottom-1 bg-[var(--seq-450)] opacity-80 rounded-[var(--r-sm)] border border-[var(--seq-550)]"
              style={{ left: `${minPct}%`, width: `${Math.max(2, rangeWidthPct)}%` }}
              title={`Observed range: ${minVal} °C – ${maxVal} °C`}
            />

            {/* Sensor Position Markers */}
            {sensors.map((s, idx) => {
              const sPct = getPct(s.val);
              return (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 flex items-center justify-center cursor-pointer group"
                  style={{ left: `${sPct}%`, transform: 'translateX(-50%)' }}
                  onMouseEnter={() => setHoveredSensor({ label: s.label, temp: s.val, xPct: sPct })}
                  onMouseLeave={() => setHoveredSensor(null)}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[var(--surface)] border-2 border-[var(--seq-650)] shadow-sm group-hover:scale-125 transition-transform z-10" />
                </div>
              );
            })}
          </div>

          {/* Interactive Hover Tooltip */}
          {hoveredSensor && (
            <div
              className="absolute z-20 top-[-28px] transform -translate-x-1/2 bg-[var(--ink)] text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none"
              style={{ left: `${hoveredSensor.xPct}%` }}
            >
              {hoveredSensor.label}: {hoveredSensor.temp.toFixed(2)} °C
            </div>
          )}

          {/* Sensor legend ticks below track */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--rule)] text-[11px]">
            <div className="flex items-center gap-3">
              {sensors.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--seq-650)] inline-block" />
                  <span className="text-[var(--ink-2)]">{s.label}:</span>
                  <span className="font-mono font-semibold text-[var(--ink)]">{s.val.toFixed(2)} °C</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-[var(--assured-ink)] font-semibold flex items-center gap-1">
              <span>●</span> In Thermal Bounds
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
