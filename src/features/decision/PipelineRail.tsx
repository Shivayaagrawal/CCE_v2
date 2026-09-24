'use client';

import React from 'react';
import Link from 'next/link';
import type { DecisionRecord, LayerKey, LayerResult } from '@/lib/data/types';
import { LAYER_ORDER, layerHref } from '@/features/labels';
import { StatusIcon } from '@/design/components/StatusBadge';

const FAILING: LayerResult[] = ['limitation', 'review', 'breach'];

const RESULT_LABEL: Record<LayerResult, string> = {
  clear: 'Clear',
  limitation: 'Limitation',
  review: 'Review',
  breach: 'Breach',
  unmeasured: 'Not measured',
};

const RESULT_INK: Record<LayerResult, string> = {
  clear: '#085C32',
  limitation: '#7A5600',
  review: '#9A3400',
  breach: '#9F0010',
  unmeasured: '#5F6C7E',
};

const RESULT_FILL: Record<LayerResult, string> = {
  clear: '#12C46A',
  limitation: '#F5C400',
  review: '#FF6A00',
  breach: '#FF1F1F',
  unmeasured: '#C5CDD8',
};

const RESULT_BG: Record<LayerResult, string> = {
  clear: '#D9FFE8',
  limitation: '#FFF4C2',
  review: '#FFE4CC',
  breach: '#FFD6D6',
  unmeasured: '#F4F6F8',
};

function Glyph({ name }: { name: LayerKey }) {
  const common = { className: 'w-3.5 h-3.5', viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true as const };
  if (name === 'input') {
    return (
      <svg {...common}>
        <path d="M3 4.5h10M3 8h10M3 11.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'model') {
    return (
      <svg {...common}>
        <rect x="2.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 13.5h4M8 11v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'policy') {
    return (
      <svg {...common}>
        <path d="M8 2.5l4.5 1.6v3.6c0 2.7-1.8 4.6-4.5 5.8-2.7-1.2-4.5-3.1-4.5-5.8V4.1L8 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'decision') {
    return (
      <svg {...common}>
        <path d="M8 2.4l5.2 5.2L8 12.8 2.8 7.6 8 2.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 2.5h5.5L12.5 5.5V13.5h-8.5V2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.2 2.7V5.6H12.2M5.5 8h5M5.5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function PipelineRail({
  record,
  active,
}: {
  record: DecisionRecord;
  active: LayerKey;
}) {
  const firstStop = LAYER_ORDER.find((layer) => FAILING.includes(record.layers[layer.key].result));

  return (
    <nav aria-label="Assurance pipeline" className="rounded-[var(--r-md)] border border-[var(--rule)] bg-[var(--surface)] px-3 py-3">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-[13px] font-semibold text-[var(--ink)]">Assurance pipeline</h2>
        {firstStop && (
          <p className="text-[12px] font-semibold" style={{ color: RESULT_INK[record.layers[firstStop.key].result] }}>
            Stops at {firstStop.name.replace(' Assurance', '')}
          </p>
        )}
      </div>
      <ol className="flex items-start overflow-x-auto">
        {LAYER_ORDER.map((layer, index) => {
          const result = record.layers[layer.key].result;
          const failing = FAILING.includes(result);
          const stoppedHere = firstStop?.key === layer.key;
          const pastStop = firstStop != null && index > LAYER_ORDER.findIndex((item) => item.key === firstStop.key);
          const isActive = active === layer.key;
          const line = failing ? RESULT_FILL[result] : pastStop ? '#C5CDD8' : RESULT_FILL.clear;
          return (
            <li key={layer.key} className="relative flex min-w-[108px] flex-1 flex-col items-center text-center px-1">
              {index > 0 && (
                <span
                  aria-hidden
                  className="absolute right-1/2 top-[15px] h-[3px] w-full"
                  style={{
                    background: pastStop ? 'repeating-linear-gradient(90deg, #C5CDD8 0 6px, transparent 6px 10px)' : line,
                  }}
                />
              )}
              <Link
                href={layerHref(record.id, layer.slug)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${layer.name}, ${RESULT_LABEL[result]}`}
                className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                style={{
                  background: RESULT_BG[result],
                  color: RESULT_FILL[result],
                  borderColor: isActive || stoppedHere ? RESULT_FILL[result] : 'transparent',
                  boxShadow: stoppedHere ? `0 0 0 4px ${RESULT_BG[result]}` : undefined,
                }}
              >
                {failing ? <StatusIcon status={result} className="w-4 h-4" /> : <Glyph name={layer.key} />}
              </Link>
              <span className={`mt-1.5 text-[12px] font-semibold ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>
                {layer.name.replace(' Assurance', '')}
              </span>
              <span className="text-[12px] font-semibold" style={{ color: RESULT_INK[result] }}>
                {RESULT_LABEL[result]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
