'use client';

import React, { useState } from 'react';
import type { DecisionRecord } from '@/lib/data/types';
import { formatCount, formatDateTime, NOT_MEASURED } from '@/lib/format';
import { Panel } from '@/design/components/Panel';
import { Tabs } from '@/design/components/Tabs';
import { CheckRow } from '@/design/components/CheckRow';
import { FaithfulnessMeter } from '@/features/charts/FaithfulnessMeter';

export function ExplanationPanel({ record }: { record: DecisionRecord }) {
  const [tab, setTab] = useState('evaluation');
  const explanation = record.explanation;

  return (
    <Panel title="Explanation assurance" subtitle={record.layers.explanation.summary} className="h-full">
      <Tabs
        items={[
          { id: 'evaluation', label: 'Explanation evaluation' },
          { id: 'alignment', label: 'Alignment checks' },
          { id: 'summary', label: 'Summary' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="mt-3 flex flex-col gap-3">
        {(tab === 'evaluation' || tab === 'summary') && (
          <>
            <blockquote className="max-h-40 overflow-y-auto border-l-2 border-[var(--primary)] bg-[var(--surface-2)] px-3 py-2 text-[13px] leading-[18px] text-[var(--ink)]">
              {explanation.externalExplanation}
            </blockquote>
            <p className="text-[11px] text-[var(--ink-3)]">
              Source {explanation.externalSource} · Generated on {formatDateTime(record.timestampUtc)}
            </p>
            <FaithfulnessMeter band={explanation.band} />
            <p className="text-[13px] text-[var(--ink-2)]">{explanation.bandRationale}</p>
          </>
        )}
        {tab === 'alignment' && explanation.checks.map((check) => <CheckRow key={check.id} check={check} />)}
        {tab === 'summary' && (
          <div className="grid grid-cols-3 gap-2 text-[13px]">
            <div>Clear {formatCount(explanation.counts.clear)}</div>
            <div>Review {formatCount(explanation.counts.review)}</div>
            <div>Breach {formatCount(explanation.counts.breach)}</div>
            <div className="col-span-3">Band {explanation.band}</div>
            <div className="col-span-3">
              Recommendation {explanation.recommendation ?? NOT_MEASURED}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
