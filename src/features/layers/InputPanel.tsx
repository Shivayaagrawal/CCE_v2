'use client';

import React, { useMemo, useState } from 'react';
import type { DecisionRecord, LayerResult } from '@/lib/data/types';
import { formatCount } from '@/lib/format';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { TelemetryTable } from '@/design/components/TelemetryTable';
import { CheckRow } from '@/design/components/CheckRow';
import { MetricTile } from '@/design/components/MetricTile';
import { StatusBadge, StatusIcon } from '@/design/components/StatusBadge';
import { TemperatureSpread } from '@/features/charts/TemperatureSpread';
import { consistencyProofs, type ConsistencyProof } from '@/features/layers/consistencyProofs';

const PROOF_IDS = new Set(['PACK-V-10', 'POWER-SIGN-06']);

const RESULT_RANK: Record<LayerResult, number> = {
  breach: 0,
  review: 1,
  limitation: 2,
  unmeasured: 3,
  clear: 4,
};

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
  const proofs = useMemo(() => consistencyProofs(record), [record]);
  const otherChecks = useMemo(
    () =>
      record.layers.input.checks
        .filter((check) => !PROOF_IDS.has(check.id))
        .slice()
        .sort((a, b) => RESULT_RANK[a.result] - RESULT_RANK[b.result]),
    [record]
  );
  const openIssues = record.layers.input.checks.filter((check) => check.result !== 'clear' && check.result !== 'unmeasured').length;
  const otherIssues = otherChecks.filter((check) => check.result !== 'clear' && check.result !== 'unmeasured').length;
  const [showOthers, setShowOthers] = useState(otherIssues > 0);

  return (
    <Panel title="Input assurance" subtitle={record.layers.input.purpose || record.layers.input.summary} className="h-full">
      <Tabs
        items={[
          { id: 'features', label: 'Input features' },
          { id: 'consistency', label: 'Cross-input consistency', count: openIssues > 0 ? openIssues : undefined },
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
            <div className="divide-y divide-[var(--rule)]">
              {proofs.map((proof) => (
                <ConsistencyExample key={proof.id} proof={proof} />
              ))}
            </div>
            <button
              type="button"
              className="mt-3 w-fit text-left text-[13px] font-semibold text-[var(--primary)] rounded-[var(--r-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-expanded={showOthers}
              onClick={() => setShowOthers((open) => !open)}
            >
              {showOthers ? 'Hide' : 'Show'} {formatCount(otherChecks.length)} other checks
              {otherIssues === 0 ? ', all clear' : `, ${formatCount(otherIssues)} not clear`}
            </button>
            {showOthers && (
              <div className="mt-2 flex flex-col">
                {otherChecks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </div>
            )}
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

function ConsistencyExample({ proof }: { proof: ConsistencyProof }) {
  const passed = proof.comparable && proof.result === 'clear';
  return (
    <article className="py-3">
      <h3 className="text-[14px] font-semibold leading-[22px] text-[var(--ink)]">
        {proof.title}
        {passed ? (
          <span className="ml-2 inline-flex items-center gap-1.5 align-middle text-[12px] font-semibold text-[var(--assured-ink)]">
            <StatusIcon status="clear" className="w-3.5 h-3.5" />
            PASS ({proof.standard})
          </span>
        ) : (
          <span className="ml-2 inline-flex align-middle">
            <StatusBadge result={proof.result} size="sm" />
          </span>
        )}
      </h3>
      <p className="mt-1 text-[13px] leading-[18px] text-[var(--ink-2)]">{proof.rule}</p>
      <p className="mt-1 text-[13px] leading-[18px] text-[var(--ink)]">
        <span className="text-[var(--ink-3)]">Observed: </span>
        <span className="font-medium tabular">{proof.observed}</span>
      </p>
    </article>
  );
}
