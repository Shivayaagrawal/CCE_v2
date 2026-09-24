'use client';

import React, { useState } from 'react';
import type { DecisionRecord } from '@/lib/data/types';
import { formatPercent } from '@/lib/format';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { CheckRow } from '@/design/components/CheckRow';
import { StatusBadge } from '@/design/components/StatusBadge';
import { engineActionLabel } from '@/features/labels';

function bandRange(min: number | null, max: number | null): string {
  if (min != null && max == null) return `≥${min}%`;
  if (min == null && max != null) return `<${max}%`;
  if (min != null && max != null) return `${min}–<${max}%`;
  return '±2.0 pp of a threshold';
}

export function PolicyPanel({ record }: { record: DecisionRecord }) {
  const [tab, setTab] = useState('evaluation');
  const matched = record.policyBands.find((band) => band.matched);

  return (
    <Panel title="Policy assurance" subtitle={record.layers.policy.summary} className="h-full">
      <Tabs
        items={[
          { id: 'evaluation', label: 'Policy evaluation' },
          { id: 'threshold', label: 'Threshold validation' },
          { id: 'summary', label: 'Summary' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3">
        {(tab === 'evaluation' || tab === 'summary') && (
          <div className="flex flex-col gap-3">
            {record.layers.policy.finding && (
              <p className="text-[13px] font-medium text-[var(--escalate-ink)]">{record.layers.policy.finding}</p>
            )}
            <div className="overflow-auto border border-[var(--rule)] rounded-[var(--r-sm)]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="h-[30px] bg-[var(--surface-2)] text-[10px] uppercase tracking-[0.06em] text-[var(--ink-3)]">
                    <th className="text-left px-2">Range</th>
                    <th className="text-left px-2">Condition</th>
                    <th className="text-left px-2">Rule</th>
                    <th className="text-left px-2">Action</th>
                    <th className="text-left px-2">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {record.policyBands.map((band) => (
                    <tr
                      key={band.ruleCode + band.label}
                      className="h-[34px] border-t border-[var(--rule)]"
                      style={band.matched ? { background: 'var(--primary-wash)', boxShadow: 'inset 3px 0 0 var(--primary)' } : undefined}
                    >
                      <td className="px-2 tabular">{bandRange(band.min, band.max)}</td>
                      <td className="px-2">{band.label}</td>
                      <td className="px-2 font-mono text-[11px]">{band.ruleCode}</td>
                      <td className="px-2">{band.actionText}</td>
                      <td className="px-2">{band.matched ? 'Matched' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-[var(--ink)]">
              Current SoH {formatPercent(record.soh.value)} → Matched band {matched ? bandRange(matched.min, matched.max) : 'Not measured'} → {matched ? engineActionLabel(matched.action) : 'Not measured'} · {matched?.ruleCode}
            </p>
            <table className="w-full text-[12px] border border-[var(--rule)] rounded-[var(--r-sm)]">
              <thead>
                <tr className="h-[30px] bg-[var(--surface-2)] text-[10px] uppercase tracking-[0.06em] text-[var(--ink-3)]">
                  <th className="text-left px-2">Standard</th>
                  <th className="text-left px-2">Scope</th>
                  <th className="text-left px-2">Applies</th>
                  <th className="text-left px-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {record.regulatory.map((rule) => (
                  <tr key={rule.standard} className="h-[34px] border-t border-[var(--rule)]">
                    <td className="px-2 font-mono text-[11px]">{rule.standard}</td>
                    <td className="px-2">{rule.scope}</td>
                    <td className="px-2">{rule.applies ? 'Yes' : 'No'}</td>
                    <td className="px-2"><StatusBadge result={rule.result} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'threshold' && record.layers.policy.checks.map((check) => <CheckRow key={check.id} check={check} />)}
      </div>
    </Panel>
  );
}
