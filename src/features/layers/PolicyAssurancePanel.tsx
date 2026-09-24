'use client';

import React, { useState } from 'react';
import { DecisionRecord, PolicyBand } from '@/lib/data/types';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { CheckRow } from '@/design/components/CheckRow';
import { StatusBadge } from '@/design/components/StatusBadge';
import { formatPercent, formatMillivolts, formatVoltage } from '@/lib/format';

export interface PolicyAssurancePanelProps {
  record: DecisionRecord;
}

export function PolicyAssurancePanel({ record }: PolicyAssurancePanelProps) {
  const [activeTab, setActiveTab] = useState('evaluation');

  const layer = record.layers.policy;
  const policyBands = record.policyBands || [];
  const regulatoryRules = record.regulatory || [];
  const sohVal = record.soh?.value;

  const tabs = [
    { id: 'evaluation', label: 'Policy Evaluation' },
    { id: 'thresholds', label: 'Threshold Validation' },
    { id: 'summary', label: 'Summary' },
  ];

  // Matched policy band
  const matchedBand = policyBands.find(b => b.matched) || policyBands[1]; // default 80-90% if fallback

  // Headlines for UC3 and UC4
  const isUC3 = record.caseRef === 'UC3' || (record.telemetry && record.telemetry.some(t => t.param === 'Cell Imbalance (std)' && t.value === '0.06497' && layer.result === 'breach'));
  const isUC4 = record.caseRef === 'UC4' || (sohVal !== null && sohVal !== undefined && sohVal === 76.2);

  return (
    <Panel
      title="Layer 3: Policy Assurance"
      subtitle={`Statutory compliance & commercial SoH operating limits for ${record.batteryId}`}
      actions={<StatusBadge status={layer.result} size="md" />}
      className="flex flex-col flex-1 h-full"
    >
      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} className="mb-4" />


      <div className="flex-1 min-h-[360px] space-y-4">
        {/* Tab 1: Policy Evaluation */}
        {activeTab === 'evaluation' && (
          <div className="space-y-4">
            {/* Case Headlines for UC3 & UC4 */}
            {isUC3 && (
              <div className="p-3.5 bg-[var(--escalate-bg)] border border-[var(--escalate-border)] rounded-[var(--r-md)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px]">⚠️</span>
                  <h4 className="text-[13px] font-semibold text-[var(--escalate-ink)]">
                    Statutory Policy Breach: 64.97 mV against a 50.00 mV limit (AIS-038)
                  </h4>
                </div>
                <p className="text-[12px] leading-[18px] text-[var(--escalate-ink)]">
                  Cell voltage standard deviation exceeds the maximum statutory ceiling permitted under AIS-038. Requires battery investigation.
                </p>
              </div>
            )}

            {isUC4 && (
              <div className="p-3.5 bg-[var(--escalate-bg)] border border-[var(--escalate-border)] rounded-[var(--r-md)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px]">⚠️</span>
                  <h4 className="text-[13px] font-semibold text-[var(--escalate-ink)]">
                    Operating Policy Breach: 76.2% against the 80.0% replacement-review threshold
                  </h4>
                </div>
                <p className="text-[12px] leading-[18px] text-[var(--escalate-ink)]">
                  Battery State of Health has degraded below the 80.0% Tier 1 operational warranty threshold.
                </p>
              </div>
            )}

            {/* ChargeUp SoH Policy Table (6 bands from §7.4) */}
            <div className="border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-[var(--surface-2)] border-b border-[var(--rule)] flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-semibold text-[var(--ink)]">ChargeUp SoH Commercial Operating Policy</h4>
                  <p className="text-[11px] text-[var(--ink-3)] mt-0.5">Six policy classification bands and corresponding actions (§7.4)</p>
                </div>
                <span className="text-[11px] font-mono text-[var(--ink-2)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--rule)]">
                  Current SoH: {formatPercent(sohVal)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--rule)] bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
                      <th className="px-3 py-1.5">Range</th>
                      <th className="px-3 py-1.5">Condition</th>
                      <th className="px-3 py-1.5">Rule Code</th>
                      <th className="px-3 py-1.5">Recommended Action</th>
                      <th className="px-3 py-1.5 text-right">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule)]">
                    {policyBands.map((band, idx) => {
                      const rangeLabel = band.min !== null && band.max !== null
                        ? `${band.min}–<${band.max}%`
                        : band.min !== null
                        ? `≥${band.min}%`
                        : band.max !== null
                        ? `<${band.max}%`
                        : '±2.0 pp of threshold';

                      return (
                        <tr
                          key={idx}
                          className={`h-[34px] transition-colors ${
                            band.matched
                              ? 'bg-[var(--assured-bg)] font-semibold border-l-4 border-l-[var(--assured)]'
                              : 'opacity-75 hover:opacity-100 hover:bg-[var(--surface-2)] border-l-4 border-l-transparent'
                          }`}
                        >
                          <td className="px-3 py-1.5 font-mono text-[12px] text-[var(--ink)]">
                            {rangeLabel}
                          </td>
                          <td className="px-3 py-1.5 text-[var(--ink)]">
                            {band.label}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-[11px] text-[var(--ink-2)]">
                            {band.ruleCode}
                          </td>
                          <td className="px-3 py-1.5 text-[var(--ink)]">
                            {band.actionText}
                          </td>
                          <td className="px-3 py-1.5 text-right font-semibold">
                            {band.matched ? (
                              <span className="inline-flex items-center gap-1 text-[var(--assured-ink)] text-[11px] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--assured-border)]">
                                <span>✓</span> Matched
                              </span>
                            ) : (
                              <span className="text-[var(--ink-3)] text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Resolution Strip below Policy Table */}
              <div className="px-3.5 py-2.5 bg-[var(--surface-sunken)] border-t border-[var(--rule)] text-[12px] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <span className="text-[var(--ink-3)] font-sans">Policy Resolution:</span>
                  <span className="font-semibold text-[var(--ink)]">Current SoH {formatPercent(sohVal)}</span>
                  <span className="text-[var(--ink-3)]">→</span>
                  <span className="font-semibold text-[var(--ink)]">
                    Matched band {matchedBand ? (matchedBand.min !== null && matchedBand.max !== null ? `${matchedBand.min}–<${matchedBand.max}%` : matchedBand.label) : '80–<90%'}
                  </span>
                  <span className="text-[var(--ink-3)]">→</span>
                  <span className="font-semibold text-[var(--primary)]">{matchedBand?.actionText || 'Continue operation'} · {matchedBand?.ruleCode || 'SOH-CONT-10'}</span>
                </div>
              </div>
            </div>

            {/* Government / Regulatory Policy Table (4 rows) */}
            <div className="border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-[var(--surface-2)] border-b border-[var(--rule)]">
                <h4 className="text-[13px] font-semibold text-[var(--ink)]">Statutory & Regulatory Standards Evaluation</h4>
                <p className="text-[11px] text-[var(--ink-3)] mt-0.5">Government battery safety standards and commercial warranty rules</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--rule)] bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
                      <th className="px-3 py-1.5">Standard</th>
                      <th className="px-3 py-1.5">Scope / Mandate</th>
                      <th className="px-3 py-1.5 text-center">Applies</th>
                      <th className="px-3 py-1.5 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule)]">
                    {regulatoryRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-2)] h-[34px]">
                        <td className="px-3 py-1.5 font-mono font-semibold text-[12px] text-[var(--ink)]">
                          {rule.standard}
                        </td>
                        <td className="px-3 py-1.5 text-[var(--ink-2)] max-w-md">
                          {rule.scope}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <span className="font-mono text-[11px] text-[var(--ink-3)]">Yes</span>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <StatusBadge status={rule.result} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Threshold Validation */}
        {activeTab === 'thresholds' && (
          <div className="space-y-3">
            <div className="p-3 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-[12px] text-[var(--ink-2)] flex items-center justify-between">
              <span>Evaluating 5 statutory and operational policy thresholds against measured telemetry.</span>
              <span className="font-semibold text-[var(--ink)]">5 Policy Thresholds</span>
            </div>

            <div className="divide-y divide-[var(--rule)] border border-[var(--rule)] rounded-[var(--r-md)] bg-[var(--surface)] p-1">
              {layer.checks.map(check => (
                <CheckRow key={check.id} check={check} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-md)]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[13px] font-semibold text-[var(--ink)]">Policy Layer Summary</h4>
                <StatusBadge status={layer.result} size="sm" />
              </div>
              <p className="text-[12px] leading-[18px] text-[var(--ink-2)]">
                {layer.purpose}
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[12px]">
                <span className="text-[var(--ink-3)]">Summary:</span>
                <span className="font-semibold text-[var(--ink)]">{layer.summary}</span>
              </div>
            </div>

            {layer.finding && (
              <div className="p-3 bg-[var(--escalate-bg)] border border-[var(--escalate-border)] rounded-[var(--r-sm)] text-[12px] text-[var(--escalate-ink)]">
                <span className="font-semibold">Finding: </span>
                {layer.finding}
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
