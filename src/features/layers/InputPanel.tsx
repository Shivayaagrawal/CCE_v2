'use client';

import React, { useMemo, useState } from 'react';
import type { DecisionRecord } from '@/lib/data/types';
import { formatCount } from '@/lib/format';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { TelemetryTable } from '@/design/components/TelemetryTable';
import { CheckRow } from '@/design/components/CheckRow';
import { MetricTile } from '@/design/components/MetricTile';
import { StatusBadge } from '@/design/components/StatusBadge';
import { TemperatureSpread } from '@/features/charts/TemperatureSpread';

function qualityFrom(record: DecisionRecord) {
  const rows = record.telemetry;
  const missing = rows.filter((row) => row.value == null).length;
  const present = rows.length - missing;
  const mandatoryPresent = rows.filter((row) => row.value != null && /must|range|threshold/i.test(row.basis)).length;
  const optionalPresent = Math.max(0, present - mandatoryPresent);
  const outOfRange = rows.filter((row) => row.flagged).length;
  const inconsistencies = record.layers.input.checks.filter((check) => check.result !== 'clear').length;
  return { total: rows.length, mandatoryPresent, optionalPresent, outOfRange, missing, inconsistencies };
}

export function InputPanel({ record }: { record: DecisionRecord }) {
  const [tab, setTab] = useState('features');
  const quality = useMemo(() => qualityFrom(record), [record]);
  const hidden = Math.max(0, record.telemetry.length - 8);

  return (
    <Panel title="Input assurance" subtitle={record.layers.input.purpose || record.layers.input.summary} className="h-full">
      <Tabs
        items={[
          { id: 'features', label: 'Input features' },
          { id: 'consistency', label: 'Cross-input consistency', count: record.layers.input.checks.length },
          { id: 'quality', label: 'Data quality' },
          { id: 'summary', label: 'Summary' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3">
        {tab === 'features' && (
          <div className="flex flex-col gap-3">
            {record.telemetry.length < 10 && (
              <p className="text-[12px] text-[var(--ink-3)]">The source supplied only these parameters. Remaining fields are not measured.</p>
            )}
            <TelemetryTable rows={record.telemetry} collapsedCount={8} />
            {hidden > 0 && <p className="text-[11px] text-[var(--ink-3)]">Collapsed view starts with 8 of {record.telemetry.length}. Expand for the remaining {hidden}.</p>}
          </div>
        )}
        {tab === 'consistency' && (
          <div className="flex flex-col">
            {record.layers.input.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
        )}
        {tab === 'quality' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <MetricTile label="Total parameters" value={formatCount(quality.total)} provenance="measured" />
            <MetricTile label="Mandatory present" value={formatCount(quality.mandatoryPresent)} provenance="measured" />
            <MetricTile label="Optional present" value={formatCount(quality.optionalPresent)} provenance="measured" />
            <MetricTile label="Out of range" value={formatCount(quality.outOfRange)} provenance="measured" />
            <MetricTile label="Missing values" value={formatCount(quality.missing)} provenance="measured" />
            <MetricTile label="Inconsistencies" value={formatCount(quality.inconsistencies)} provenance="measured" />
          </div>
        )}
        {tab === 'summary' && (
          <div className="flex flex-col gap-3">
            <TemperatureSpread rows={record.telemetry} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[12px]">
              <div>Total {formatCount(quality.total)}</div>
              <div>Mandatory {formatCount(quality.mandatoryPresent)}</div>
              <div>Optional {formatCount(quality.optionalPresent)}</div>
              <div>Out of range {formatCount(quality.outOfRange)}</div>
              <div>Missing {formatCount(quality.missing)}</div>
              <div className="flex items-center gap-2">
                Input assurance <StatusBadge result={record.layers.input.result} size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
