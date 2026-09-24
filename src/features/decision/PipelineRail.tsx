'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DecisionRecord, LayerKey } from '@/lib/data/types';
import { StatusBadge, StatusIcon } from '@/design/components/StatusBadge';
import { OutcomeCard } from '@/design/components/OutcomeCard';

export interface PipelineRailProps {
  record: DecisionRecord;
  className?: string;
}

const LAYER_KEYS: LayerKey[] = ['input', 'model', 'policy', 'decision', 'explanation'];

const LAYER_NAMES: Record<LayerKey, string> = {
  input: 'Input Assurance',
  model: 'Model Assurance',
  policy: 'Policy Assurance',
  decision: 'Decision Assurance',
  explanation: 'Explanation Assurance',
};

const RESULT_ACCENT_COLORS: Record<string, string> = {
  clear: 'var(--assured)',
  limitation: 'var(--limitation)',
  review: 'var(--review)',
  breach: 'var(--escalate)',
  unmeasured: 'var(--unmeasured)',
};

export function PipelineRail({ record, className = '' }: PipelineRailProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`flex flex-col justify-between gap-4 p-3 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--rule)] shadow-[var(--e1)] select-none h-full ${className}`}
      aria-label="Assurance Pipeline Rail"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--rule)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Assurance Pipeline
          </span>
          <span className="text-[10px] font-mono text-[var(--ink-3)]">5 Layers</span>
        </div>

        {/* 5 Layer Pipeline Steps */}
        <div className="flex flex-col gap-1.5">
          {LAYER_KEYS.map((key, index) => {
            const layer = record.layers[key];
            const targetHref = `/decisions/${record.id}/${key}`;
            const isActive = pathname.includes(`/${key}`);
            const accentColor = RESULT_ACCENT_COLORS[layer.result] || 'var(--rule)';

            return (
              <Link
                key={key}
                href={targetHref}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col gap-1 p-2.5 rounded-[var(--r-sm)] border transition-all text-left group ${
                  isActive
                    ? 'bg-[var(--surface-2)] border-[var(--rule-strong)] shadow-sm'
                    : 'bg-[var(--surface)] border-transparent hover:border-[var(--rule)] hover:bg-[var(--surface-sunken)]'
                }`}
              >
                {/* 2px active left accent */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                    style={{ backgroundColor: accentColor }}
                  />
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[var(--ink-3)] w-3.5">
                      0{index + 1}
                    </span>
                    <span className={`text-[12px] font-semibold truncate ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-2)] group-hover:text-[var(--ink)]'}`}>
                      {LAYER_NAMES[key]}
                    </span>
                  </div>
                  <StatusBadge result={layer.result} size="sm" />
                </div>

                <div className="text-[11px] text-[var(--ink-3)] line-clamp-1 pl-5">
                  {layer.summary}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Outcome Card at size="rail" */}
      <div className="pt-2 border-t border-[var(--rule)]">
        <OutcomeCard
          outcome={record.outcome}
          action={record.action}
          size="rail"
        />
      </div>
    </nav>
  );
}
