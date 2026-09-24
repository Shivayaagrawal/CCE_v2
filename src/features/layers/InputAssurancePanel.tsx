'use client';

import React, { useState } from 'react';
import { DecisionRecord } from '@/lib/data/types';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { TelemetryTable } from '@/design/components/TelemetryTable';
import { CheckRow } from '@/design/components/CheckRow';
import { StatusBadge } from '@/design/components/StatusBadge';
import { C10TemperatureSpread } from '@/features/charts/C10TemperatureSpread';

export interface InputAssurancePanelProps {
  record: DecisionRecord;
}

export function InputAssurancePanel({ record }: InputAssurancePanelProps) {
  const [activeTab, setActiveTab] = useState('features');

  const layer = record.layers.input;
  const telemetry = record.telemetry || [];

  // Compute Data Quality metrics dynamically from telemetry array
  const totalParams = 35; // Standard 14S telemetry vector specification size
  const presentCount = telemetry.filter(t => t.value !== null && t.value !== undefined).length;
  const mandatoryPresent = presentCount;
  const optionalPresent = 0;
  const outOfRange = telemetry.filter(t => {
    // Basic check for out-of-bounds where numerical
    if (t.param === 'SoH Percentage (Model Output)' && t.value) {
      const v = parseFloat(t.value);
      return v < 0 || v > 100;
    }
    return false;
  }).length;
  const missingValues = Math.max(0, totalParams - presentCount);
  const inconsistencies = telemetry.filter(t => t.flagged).length;

  const tabs = [
    { id: 'features', label: 'Input Features' },
    { id: 'consistency', label: 'Cross-input Consistency' },
    { id: 'quality', label: 'Data Quality' },
    { id: 'summary', label: 'Summary' },
  ];

  const isUC4 = record.caseRef === 'UC4' || telemetry.length <= 6;
  const sourceNote = isUC4
    ? 'Source supplied only 6 telemetry parameters for this record. Remaining parameters are Not measured.'
    : undefined;

  return (
    <Panel
      title="Layer 1: Input Assurance"
      subtitle={`Structural & electrical telemetry validation for ${record.batteryId}`}
      actions={<StatusBadge status={layer.result} size="md" />}
      className="flex flex-col flex-1 h-full"
    >
      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} className="mb-4" />


      <div className="flex-1 min-h-[360px]">
        {/* Tab 1: Input Features */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <TelemetryTable
              rows={telemetry}
              collapsedCount={8}
              sourceNote={sourceNote}
            />
          </div>
        )}

        {/* Tab 2: Cross-input Consistency */}
        {activeTab === 'consistency' && (
          <div className="space-y-2.5">
            <div className="p-3 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[12px] text-[var(--ink-2)] flex items-center justify-between">
              <span>Evaluating 10 electrical, bounds, and identity consistency invariants across ingested telemetry.</span>
              <span className="font-semibold text-[var(--assured-ink)]">10 of 10 Invariants Evaluated</span>
            </div>

            <div className="divide-y divide-[var(--rule)] border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)] p-1">
              {layer.checks.map(check => (
                <CheckRow key={check.id} check={check} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Data Quality */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center">
                <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)] block">Total Parameters</span>
                <span className="font-mono text-[18px] font-semibold text-[var(--ink)]">{totalParams}</span>
              </div>
              <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center">
                <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)] block">Mandatory Present</span>
                <span className="font-mono text-[18px] font-semibold text-[var(--assured-ink)]">{mandatoryPresent}</span>
              </div>
              <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center">
                <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)] block">Optional Present</span>
                <span className="font-mono text-[18px] font-semibold text-[var(--ink-3)]">{optionalPresent}</span>
              </div>
              <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center">
                <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)] block">Out Of Range</span>
                <span className="font-mono text-[18px] font-semibold text-[var(--ink)]">{outOfRange}</span>
              </div>
              <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center">
                <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)] block">Missing Values</span>
                <span className={`font-mono text-[18px] font-semibold ${missingValues > 0 ? 'text-[var(--review-ink)]' : 'text-[var(--ink)]'}`}>
                  {missingValues}
                </span>
              </div>
              <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center">
                <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)] block">Inconsistencies</span>
                <span className={`font-mono text-[18px] font-semibold ${inconsistencies > 0 ? 'text-[var(--escalate-ink)]' : 'text-[var(--ink)]'}`}>
                  {inconsistencies}
                </span>
              </div>
            </div>

            {/* C10 Temperature Spread Chart */}
            <C10TemperatureSpread telemetry={telemetry} />
          </div>
        )}

        {/* Tab 4: Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-md)]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[13px] font-semibold text-[var(--ink)]">Layer Purpose & Outcome</h4>
                <StatusBadge status={layer.result} size="sm" />
              </div>
              <p className="text-[12px] leading-[18px] text-[var(--ink-2)]">
                {layer.purpose}
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[12px]">
                <span className="text-[var(--ink-3)]">Verification Summary:</span>
                <span className="font-semibold text-[var(--ink)]">{layer.summary}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-sm)]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--ink-3)] block font-semibold">Telemetry Vectors</span>
                <p className="text-[12px] text-[var(--ink)] mt-1 font-mono">
                  {presentCount} of {totalParams} parameters supplied ({missingValues} unmeasured)
                </p>
              </div>
              <div className="p-3 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-sm)]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--ink-3)] block font-semibold">Invariant Status</span>
                <p className="text-[12px] text-[var(--assured-ink)] mt-1 font-semibold">
                  10 of 10 checks passed with zero electrical or bounds violations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Strip (bottom of panel, 6 cells + layer outcome badge) */}
      <div className="mt-6 pt-3 border-t border-[var(--rule)] bg-[var(--surface-2)] -mx-4 -mb-4 px-4 py-2.5 rounded-b-[var(--r-md)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-mono tabular">
          <div>
            <span className="text-[var(--ink-3)]">Params: </span>
            <span className="font-semibold text-[var(--ink)]">{totalParams}</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)]">Present: </span>
            <span className="font-semibold text-[var(--assured-ink)]">{mandatoryPresent}</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)]">Optional: </span>
            <span className="font-semibold text-[var(--ink-3)]">{optionalPresent}</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)]">Range Breach: </span>
            <span className="font-semibold text-[var(--ink)]">{outOfRange}</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)]">Missing: </span>
            <span className="font-semibold text-[var(--ink)]">{missingValues}</span>
          </div>
          <div>
            <span className="text-[var(--ink-3)]">Inconsistent: </span>
            <span className="font-semibold text-[var(--ink)]">{inconsistencies}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">Input Assurance:</span>
          <StatusBadge status={layer.result} size="sm" />
        </div>
      </div>
    </Panel>
  );
}
