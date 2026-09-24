'use client';

import React, { useEffect, useState } from 'react';
import type { DecisionRecord } from '@/lib/data/types';
import { getAggregates } from '@/lib/data';
import { formatCount, NOT_MEASURED } from '@/lib/format';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { KeyValue } from '@/design/components/KeyValue';
import { EmptyState } from '@/design/components/EmptyState';
import { clip } from '@/features/labels';
import { HistoricalPatternChart } from '@/features/charts/HistoricalPatternChart';

function findings(record: DecisionRecord) {
  const items: { title: string; body: string }[] = [];
  if (record.reason) items.push({ title: 'Governed reason', body: clip(record.reason, 220) });
  (['input', 'model', 'policy', 'decision', 'explanation'] as const).forEach((key) => {
    const finding = record.layers[key].finding;
    if (finding) items.push({ title: record.layers[key].name, body: clip(finding, 220) });
  });
  return items.slice(0, 4);
}

export function DecisionPanel({ record }: { record: DecisionRecord }) {
  const [tab, setTab] = useState('evaluation');
  const [fleetMean, setFleetMean] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAggregates().then((aggregates) => {
      if (cancelled) return;
      const weighted = aggregates.sohTrend.reduce(
        (acc, point) => {
          acc.sum += point.meanSohPct;
          acc.n += point.meanSohPct > 0 ? 1 : 0;
          return acc;
        },
        { sum: 0, n: 0 }
      );
      setFleetMean(weighted.n === 0 ? null : Math.round((weighted.sum / weighted.n) * 10) / 10);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const owner = record.escalation.assignedTo
    ? `${record.escalation.assignedTo}${record.escalation.rolePlaceholder ? ' (provisional)' : ''}`
    : NOT_MEASURED;
  const horizon = record.telemetry.find((row) => row.param === 'Forecast Horizon');

  return (
    <Panel title="Decision assurance" subtitle={record.layers.decision.summary} className="h-full">
      <Tabs
        items={[
          { id: 'evaluation', label: 'Decision evaluation' },
          { id: 'history', label: 'Historical context' },
          { id: 'summary', label: 'Summary' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3 flex flex-col gap-3">
        {tab === 'evaluation' && (
          <div className="flex flex-col gap-2">
            {findings(record).map((item, index) => (
              <div
                key={item.title}
                className={
                  index === 0
                    ? `rounded-[var(--r-sm)] border px-3 py-2 ${
                        record.outcome === 'ASSURED WITH LIMITATIONS'
                          ? 'border-[var(--limitation-border)] bg-[var(--limitation-bg)]'
                          : record.outcome === 'REVIEW REQUIRED'
                            ? 'border-[var(--review-border)] bg-[var(--review-bg)]'
                            : record.outcome === 'ESCALATE'
                              ? 'border-[var(--escalate-border)] bg-[var(--escalate-bg)]'
                              : 'border-[var(--rule)]'
                      }`
                    : 'px-1 py-1'
                }
              >
                <div className={`font-semibold text-[var(--ink)] ${index === 0 ? 'text-[14px]' : 'text-[12px]'}`}>{item.title}</div>
                <p className={`leading-[18px] text-[var(--ink-2)] mt-0.5 ${index === 0 ? 'text-[13px]' : 'text-[12px]'}`}>{item.body}</p>
              </div>
            ))}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] mb-1">Rules triggered</h4>
              {record.context.rulesTriggered.length === 0 ? (
                <EmptyState title="No contextual rules triggered" detail="This record did not fire a contextual decision rule." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {record.context.rulesTriggered.map((rule) => (
                    <li key={rule.id} className="text-[13px]">
                      <span className="font-mono text-[11px] mr-2">{rule.id}</span>
                      {rule.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {tab === 'history' && <HistoricalPatternChart record={record} fleetMeanSoh={fleetMean} />}
        {tab === 'summary' && (
          <div className="grid grid-cols-2 gap-x-4">
            <KeyValue label="Total decisions for this vehicle" value={formatCount(record.context.totalDecisionsForVehicle)} />
            <KeyValue label="Replacement actions taken" value={formatCount(record.context.replacementsOnVehicle)} />
            <KeyValue label="Previous battery ID" value={record.context.previousBatteryId} mono />
            <KeyValue label="Cycle count at assessment" value={formatCount(record.context.cycleCountAtAssessment)} />
            <KeyValue label="Forecast horizon" value={horizon?.value ? `${horizon.value} ${horizon.unit}` : null} />
            <KeyValue label="Escalation owner" value={record.escalation.required ? owner : 'Not required'} />
          </div>
        )}
        {record.escalation.required && (
          <div className="border border-[var(--escalate-border)] bg-[var(--escalate-bg)] rounded-[var(--r-md)] px-3 py-2 text-[13px]">
            <div className="font-semibold text-[var(--escalate-ink)]">Escalation · {owner}</div>
            <p className="text-[var(--ink)] mt-0.5">{record.escalation.basis}</p>
          </div>
        )}
      </div>
    </Panel>
  );
}
