'use client';

import React, { useState } from 'react';
import { TelemetryRow } from '@/lib/data/types';
import { formatVoltage, formatMillivolts, NOT_MEASURED } from '@/lib/format';
import { EmptyState } from '@/design/components/EmptyState';

export interface C7CellVoltageDistributionProps {
  telemetry: TelemetryRow[];
  className?: string;
}

export function C7CellVoltageDistribution({ telemetry, className = '' }: C7CellVoltageDistributionProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ id: string; voltage: number; index: number } | null>(null);

  // Extract 14 cell voltages from telemetry
  const cellRows = telemetry.filter(t => /^Cell \d{2} Voltage$/.test(t.param));
  const hasCellTelemetry = cellRows.length === 14 && cellRows.every(r => r.value !== null && r.value !== undefined);

  if (!hasCellTelemetry) {
    return (
      <div className={`p-4 bg-[var(--surface-sunken)] rounded-[var(--r-md)] border border-[var(--rule)] flex flex-col items-center justify-center min-h-[220px] ${className}`}>
        <EmptyState
          title="Cell-level telemetry not supplied for this record."
          detail="Cell voltage distribution (C7) requires 14S individual cell telemetry vectors."
        />
      </div>
    );
  }

  const cells = cellRows.map((r, i) => ({
    id: `C${(i + 1).toString().padStart(2, '0')}`,
    label: r.param,
    voltage: parseFloat(r.value!),
  }));

  const voltages = cells.map(c => c.voltage);
  const sum = voltages.reduce((acc, v) => acc + v, 0);
  const mean = sum / voltages.length;
  
  // Imbalance sigma
  const variance = voltages.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / voltages.length;
  const sigma = Math.sqrt(variance);
  const sigmaMv = sigma * 1000;

  // Limits
  const validMinV = 2.50;
  const validMaxV = 4.20;
  
  // Chart visual scaling: scale from 3.50V to 4.10V to clearly show the cell bar heights and variance
  // or full range 2.50 to 4.20 with zoom indicator
  const chartMinV = 3.60;
  const chartMaxV = 4.10;
  const chartRange = chartMaxV - chartMinV;

  const getYPercent = (v: number) => {
    const clamped = Math.max(chartMinV, Math.min(chartMaxV, v));
    return ((clamped - chartMinV) / chartRange) * 100;
  };

  const meanPct = getYPercent(mean);

  return (
    <div className={`p-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] uppercase bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded-[var(--r-sm)]">
              C7
            </span>
            <h4 className="text-[13px] font-semibold text-[var(--ink)]">Cell Voltage Distribution (14S Pack)</h4>
          </div>
          <p className="text-[11px] text-[var(--ink-3)] mt-0.5">
            Valid Operating Window [2.5000 V – 4.2000 V] · Statutory Imbalance Limit ≤ 50.00 mV (AIS-038)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[var(--ink-3)] uppercase tracking-wider block">Pack Std Dev (σ)</span>
            <span className={`font-mono text-[12px] font-semibold ${sigmaMv > 50 ? 'text-[var(--escalate-ink)]' : 'text-[var(--assured-ink)]'}`}>
              {sigmaMv.toFixed(2)} mV {sigmaMv > 50 ? '(Breach >50mV)' : '(Within limit)'}
            </span>
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
      </div>

      {showTable ? (
        <div className="overflow-x-auto max-h-[220px]">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="sticky top-0 border-b border-[var(--rule)] bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
                <th className="px-2 py-1">Cell</th>
                <th className="px-2 py-1 text-right">Measured Voltage</th>
                <th className="px-2 py-1 text-right">Δ from Mean ({formatVoltage(mean)})</th>
                <th className="px-2 py-1 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] font-mono tabular">
              {cells.map((c, i) => {
                const diffMv = (c.voltage - mean) * 1000;
                const inBand = c.voltage >= validMinV && c.voltage <= validMaxV;
                return (
                  <tr key={i} className="hover:bg-[var(--surface-2)]">
                    <td className="px-2 py-1 font-sans font-medium text-[var(--ink)]">{c.label}</td>
                    <td className="px-2 py-1 text-right font-semibold text-[var(--ink)]">{formatVoltage(c.voltage)}</td>
                    <td className={`px-2 py-1 text-right text-[11px] ${diffMv >= 0 ? 'text-[var(--ink-2)]' : 'text-[var(--review-ink)]'}`}>
                      {diffMv >= 0 ? `+${diffMv.toFixed(2)} mV` : `${diffMv.toFixed(2)} mV`}
                    </td>
                    <td className="px-2 py-1 text-right font-sans text-[11px]">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${inBand ? 'bg-[var(--assured-bg)] text-[var(--assured-ink)]' : 'bg-[var(--escalate-bg)] text-[var(--escalate-ink)]'}`}>
                        {inBand ? 'Valid' : 'Out of Band'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-end pt-3 pb-1" aria-label="14-cell voltage distribution chart">
          {/* Chart area with Y-axis grid and 14 bars */}
          <div className="relative h-[140px] w-full border-b border-[var(--rule-strong)]">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-[var(--rule)] w-full text-[9px] font-mono text-[var(--ink-3)] flex justify-end pr-1">4.10V</div>
              <div className="border-b border-dashed border-[var(--rule)] w-full text-[9px] font-mono text-[var(--ink-3)] flex justify-end pr-1">3.95V</div>
              <div className="border-b border-dashed border-[var(--rule)] w-full text-[9px] font-mono text-[var(--ink-3)] flex justify-end pr-1">3.80V</div>
              <div className="border-b border-dashed border-[var(--rule)] w-full text-[9px] font-mono text-[var(--ink-3)] flex justify-end pr-1">3.65V</div>
            </div>

            {/* Mean Line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-[var(--primary)] z-10 pointer-events-none"
              style={{ bottom: `${meanPct}%` }}
            >
              <span className="absolute -top-3.5 left-2 bg-[var(--primary)] text-white text-[9px] font-mono px-1 rounded">
                Mean: {mean.toFixed(4)} V
              </span>
            </div>

            {/* 14 Bars Container */}
            <div className="absolute inset-0 flex items-end justify-between px-2 gap-1.5 z-0">
              {cells.map((c, i) => {
                const heightPct = getYPercent(c.voltage);
                const isOutOfBand = c.voltage < validMinV || c.voltage > validMaxV;
                const isHovered = hoveredCell?.index === i;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredCell({ id: c.id, voltage: c.voltage, index: i })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-[3px] transition-all ${
                        isOutOfBand
                          ? 'bg-[var(--escalate)]'
                          : isHovered
                          ? 'bg-[var(--primary)]'
                          : 'bg-[var(--seq-450)] hover:bg-[var(--primary)]'
                      }`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredCell && (
              <div
                className="absolute z-20 top-2 left-1/2 transform -translate-x-1/2 bg-[var(--ink)] text-white text-[10px] font-mono px-2 py-1 rounded shadow pointer-events-none flex items-center gap-2"
              >
                <span>{hoveredCell.id}</span>
                <span className="font-semibold">{hoveredCell.voltage.toFixed(4)} V</span>
                <span className="text-[var(--ink-muted)]">({((hoveredCell.voltage - mean) * 1000).toFixed(2)} mV vs mean)</span>
              </div>
            )}
          </div>

          {/* X-axis Labels (Cell 01 to Cell 14) */}
          <div className="flex justify-between px-2 pt-1 text-[9px] font-mono text-[var(--ink-3)]">
            {cells.map((c, i) => (
              <span key={i} className="flex-1 text-center">
                {c.id}
              </span>
            ))}
          </div>

          {/* Footer stats line */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--rule)] text-[11px] text-[var(--ink-2)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--seq-450)]" />
                <span>Cell Voltage (2.50–4.20 V Valid)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 border-t-2 border-dashed border-[var(--primary)]" />
                <span>Mean: {formatVoltage(mean)}</span>
              </div>
            </div>

            <div className="font-mono text-[11px]">
              Min: <span className="font-semibold">{formatVoltage(Math.min(...voltages))}</span> · Max: <span className="font-semibold">{formatVoltage(Math.max(...voltages))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
