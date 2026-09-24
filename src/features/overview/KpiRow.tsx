'use client';

import React from 'react';
import { FleetAggregates } from '@/lib/data/types';
import { formatCount, formatPercent } from '@/lib/format';
import { calculateLargestRemainderShares } from '@/lib/data/fixture/fleet';

export interface KpiRowProps {
  aggregates: FleetAggregates;
  className?: string;
}

export function KpiRow({ aggregates, className = '' }: KpiRowProps) {
  const total = aggregates.totalEvents;
  const assuredCount = aggregates.byOutcome.ASSURED || 0;
  const limitationCount = aggregates.byOutcome['ASSURED WITH LIMITATIONS'] || 0;
  const reviewCount = aggregates.byOutcome['REVIEW REQUIRED'] || 0;
  const escalateCount = aggregates.byOutcome.ESCALATE || 0;

  // Largest remainder shares so the four outcome percentages sum to 100.0% (§6.3)
  const shares = calculateLargestRemainderShares(
    [assuredCount, limitationCount, reviewCount, escalateCount],
    total
  );

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 ${className}`}>
      {/* Tile 1: Total Decision Events */}
      <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[92px]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] truncate">
          Total Decision Events
        </span>
        <div className="mt-1">
          <span className="font-mono text-[28px] leading-[32px] font-semibold text-[var(--ink)] tabular">
            {formatCount(total)}
          </span>
        </div>
        <div className="text-[11px] text-[var(--ink-3)] mt-0.5 truncate">
          14-day fleet observation window
        </div>
      </div>

      {/* Tile 2: Assured */}
      <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[92px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--assured-ink)] truncate">
            Assured
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--assured)] shrink-0" />
        </div>
        <div className="mt-1">
          <span className="font-mono text-[28px] leading-[32px] font-semibold text-[var(--ink)] tabular">
            {formatCount(assuredCount)}
          </span>
        </div>
        <div className="text-[11px] text-[var(--ink-3)] mt-0.5 truncate">
          <span className="font-semibold text-[var(--assured-ink)]">{formatPercent(shares[0])}</span> share · Tier 1 clearance
        </div>
      </div>

      {/* Tile 3: Assured with Limitations */}
      <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[92px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--limitation-ink)] truncate">
            Assured with Limitations
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--limitation)] shrink-0" />
        </div>
        <div className="mt-1">
          <span className="font-mono text-[28px] leading-[32px] font-semibold text-[var(--ink)] tabular">
            {formatCount(limitationCount)}
          </span>
        </div>
        <div className="text-[11px] text-[var(--ink-3)] mt-0.5 truncate">
          <span className="font-semibold text-[var(--limitation-ink)]">{formatPercent(shares[1])}</span> share · Version / delta review
        </div>
      </div>

      {/* Tile 4: Review Required */}
      <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[92px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--review-ink)] truncate">
            Review Required
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--review)] shrink-0" />
        </div>
        <div className="mt-1">
          <span className="font-mono text-[28px] leading-[32px] font-semibold text-[var(--ink)] tabular">
            {formatCount(reviewCount)}
          </span>
        </div>
        <div className="text-[11px] text-[var(--ink-3)] mt-0.5 truncate">
          <span className="font-semibold text-[var(--review-ink)]">{formatPercent(shares[2])}</span> share · Manual investigation
        </div>
      </div>

      {/* Tile 5: Escalate */}
      <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[92px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--escalate-ink)] truncate">
            Escalate
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--escalate)] shrink-0" />
        </div>
        <div className="mt-1">
          <span className="font-mono text-[28px] leading-[32px] font-semibold text-[var(--ink)] tabular">
            {formatCount(escalateCount)}
          </span>
        </div>
        <div className="text-[11px] text-[var(--ink-3)] mt-0.5 truncate">
          <span className="font-semibold text-[var(--escalate-ink)]">{formatPercent(shares[3])}</span> share · Root cause inspection
        </div>
      </div>
    </div>
  );
}
