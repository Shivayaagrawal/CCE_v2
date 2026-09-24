'use client';

import React, { useState, useMemo } from 'react';
import { EventFilters, DecisionEvent, Outcome } from '@/lib/data/types';
import { FLEET_EVENTS, filterFleetEvents, computeFleetAggregates, FLEET_ALERTS } from '@/lib/data/fixture/fleet';
import { exportEventsToCsv } from '@/lib/export';
import { DemonstrationBanner } from './DemonstrationBanner';
import { FilterBar } from './FilterBar';
import { KpiRow } from './KpiRow';
import { RecentDecisionEventsTable } from './RecentDecisionEventsTable';
import { formatPercent } from '@/lib/format';
import { StatusBadge } from '@/design/components/StatusBadge';

export function OverviewDashboard() {
  const [filters, setFilters] = useState<EventFilters>({});

  // Compute filtered events and aggregates reactively
  const filteredEvents = useMemo(() => {
    return filterFleetEvents(FLEET_EVENTS, filters);
  }, [filters]);

  const aggregates = useMemo(() => {
    return computeFleetAggregates(filteredEvents);
  }, [filteredEvents]);

  const handleExport = () => {
    exportEventsToCsv(filteredEvents);
  };

  const handleCrossFilterOutcome = (outcome: Outcome) => {
    if (filters.outcomes?.includes(outcome)) {
      const next = filters.outcomes.filter((o) => o !== outcome);
      setFilters({ ...filters, outcomes: next.length > 0 ? next : undefined, page: 1 });
    } else {
      setFilters({ ...filters, outcomes: [outcome], page: 1 });
    }
  };

  const handleCrossFilterSohBand = (min: number, max: number) => {
    if (filters.sohBand?.min === min && filters.sohBand?.max === max) {
      const { sohBand, ...rest } = filters;
      setFilters({ ...rest, page: 1 });
    } else {
      setFilters({ ...filters, sohBand: { min, max }, page: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Demonstration Banner (SPEC.md §14.4) */}
      <DemonstrationBanner />

      {/* 2. Filter Bar (6 real controls + Search + Export CSV + Active Chips) */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onExport={handleExport}
        totalFiltered={filteredEvents.length}
      />

      {/* 3. KPI Row (5 tiles: Total, Assured, Limitations, Review, Escalate) */}
      <KpiRow aggregates={aggregates} />

      {/* 4. Coordinated Chart Row (C1 · C2 · C3 · C4, 3 cols each, 250px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* C1: Assurance Result Distribution */}
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[250px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">C1</span>
              <h4 className="text-[13px] font-semibold text-[var(--ink)]">Assurance Result Distribution</h4>
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-3)]">{filteredEvents.length} total</span>
          </div>

          <div className="my-3 flex flex-col gap-2">
            {[
              { outcome: 'ASSURED' as Outcome, label: 'Assured', count: aggregates.byOutcome.ASSURED, color: 'var(--assured)' },
              { outcome: 'ASSURED WITH LIMITATIONS' as Outcome, label: 'Limitations', count: aggregates.byOutcome['ASSURED WITH LIMITATIONS'], color: 'var(--limitation)' },
              { outcome: 'REVIEW REQUIRED' as Outcome, label: 'Review Req.', count: aggregates.byOutcome['REVIEW REQUIRED'], color: 'var(--review)' },
              { outcome: 'ESCALATE' as Outcome, label: 'Escalate', count: aggregates.byOutcome.ESCALATE, color: 'var(--escalate)' },
            ].map((item) => {
              const pct = filteredEvents.length > 0 ? (item.count / filteredEvents.length) * 100 : 0;
              const isSelected = filters.outcomes?.includes(item.outcome);

              return (
                <div
                  key={item.outcome}
                  onClick={() => handleCrossFilterOutcome(item.outcome)}
                  className={`p-1.5 rounded-[var(--r-sm)] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[var(--primary-wash)] border border-[var(--primary)]' : 'hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium text-[var(--ink)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono font-semibold text-[var(--ink-2)] tabular">
                      {item.count} ({formatPercent(pct)})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--surface-sunken)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, pct)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-[var(--ink-3)] pt-2 border-t border-[var(--rule)] flex justify-between">
            <span>Click slice to cross-filter</span>
            <span className="font-semibold text-[var(--assured-ink)]">{aggregates.assuranceRate}% Assured</span>
          </div>
        </div>

        {/* C2: SoH Distribution */}
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[250px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">C2</span>
              <h4 className="text-[13px] font-semibold text-[var(--ink)]">SoH Distribution</h4>
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-3)]">5 Bins</span>
          </div>

          <div className="my-2 flex-1 flex items-end justify-between gap-1.5 pt-6 pb-1 border-b border-[var(--rule)]">
            {aggregates.sohDistribution.map((b) => {
              const maxCount = Math.max(...aggregates.sohDistribution.map((x) => x.count), 1);
              const heightPct = (b.count / maxCount) * 100;

              return (
                <div
                  key={b.bin}
                  onClick={() => {
                    if (b.bin === '≥90%') handleCrossFilterSohBand(90, 101);
                    else if (b.bin === '80–<90%') handleCrossFilterSohBand(80, 90);
                    else if (b.bin === '70–<80%') handleCrossFilterSohBand(70, 80);
                    else if (b.bin === '60–<70%') handleCrossFilterSohBand(60, 70);
                    else handleCrossFilterSohBand(0, 60);
                  }}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  <span className="text-[9px] font-mono text-[var(--ink-3)] mb-1 opacity-80 group-hover:opacity-100">
                    {b.count}
                  </span>
                  <div
                    className="w-full bg-[var(--seq-450)] hover:bg-[var(--primary)] rounded-t-[3px] transition-all"
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />
                  <span className="text-[9px] font-mono text-[var(--ink-3)] mt-1 truncate max-w-[45px]">
                    {b.bin}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-[var(--ink-3)] pt-1 flex justify-between">
            <span>Sequential ramp bins</span>
            <span>Click bar to filter</span>
          </div>
        </div>

        {/* C3: SoH Trend (Fleet Mean) */}
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[250px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">C3</span>
              <h4 className="text-[13px] font-semibold text-[var(--ink)]">SoH Trend (Fleet Average)</h4>
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-3)]">14-Day</span>
          </div>

          <div className="my-auto py-4 text-center">
            <div className="font-mono text-[32px] font-semibold text-[var(--primary)] tabular">
              84.8%
            </div>
            <p className="text-[11px] text-[var(--ink-3)] mt-1">
              Fleet Average SoH across 312 active assets
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[var(--assured-ink)] font-semibold">
              <span>● Stable Health Profile</span>
            </div>
          </div>

          <div className="text-[10px] text-[var(--ink-3)] pt-2 border-t border-[var(--rule)] flex justify-between">
            <span>Window: 18 May – 1 June</span>
            <span className="text-[var(--primary)] font-medium">Daily Track</span>
          </div>
        </div>

        {/* C4: Decision Distribution */}
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between min-h-[250px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">C4</span>
              <h4 className="text-[13px] font-semibold text-[var(--ink)]">Decision Distribution</h4>
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-3)]">5 Actions</span>
          </div>

          <div className="my-2 space-y-1.5">
            {[
              { action: 'CONTINUE_OPERATION', label: 'Continue Op', count: aggregates.byAction.CONTINUE_OPERATION, color: '#2A78D6' },
              { action: 'SCHEDULE_MAINTENANCE', label: 'Maintenance', count: aggregates.byAction.SCHEDULE_MAINTENANCE, color: '#EB6834' },
              { action: 'REPLACE_BATTERY', label: 'Replace Battery', count: aggregates.byAction.REPLACE_BATTERY, color: '#1BAF7A' },
              { action: 'RETIRE_ASSET', label: 'Retire Asset', count: aggregates.byAction.RETIRE_ASSET, color: '#EDA100' },
              { action: 'ESCALATE_FOR_REVIEW', label: 'Escalate', count: aggregates.byAction.ESCALATE_FOR_REVIEW, color: '#E87BA4' },
            ].map((act) => (
              <div key={act.action} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-[var(--ink)]">
                  <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: act.color }} />
                  <span>{act.label}</span>
                </span>
                <span className="font-mono text-[var(--ink-2)] tabular">
                  {act.count} ({filteredEvents.length > 0 ? formatPercent((act.count / filteredEvents.length) * 100) : '0.0%'})
                </span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[var(--ink-3)] pt-2 border-t border-[var(--rule)] flex justify-between">
            <span>Categorical slots 1–5</span>
            <span>Policy Governed</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row (Recent Decision Events 7 cols + Pipeline & Alerts 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Recent Decision Events (7 Columns) */}
        <div className="lg:col-span-7">
          <RecentDecisionEventsTable events={filteredEvents} />
        </div>

        {/* Pipeline Overview (C5) + Alerts (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* C5 Assurance Pipeline Overview */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-semibold text-[var(--ink-3)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">C5</span>
                <h4 className="text-[13px] font-semibold text-[var(--ink)]">Assurance Pipeline Overview</h4>
              </div>
              <span className="text-[11px] text-[var(--assured-ink)] font-semibold">5-Layer Clear Rates</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 relative">
              {[
                { name: 'Input', rate: aggregates.layerClearRate.input },
                { name: 'Model', rate: aggregates.layerClearRate.model },
                { name: 'Policy', rate: aggregates.layerClearRate.policy },
                { name: 'Decision', rate: aggregates.layerClearRate.decision },
                { name: 'Explanation', rate: aggregates.layerClearRate.explanation },
              ].map((layer, idx) => (
                <div
                  key={layer.name}
                  className="p-2 bg-[var(--surface-2)] border border-[var(--rule)] rounded-[var(--r-sm)] text-center flex flex-col justify-between"
                >
                  <span className="text-[10px] uppercase font-semibold text-[var(--ink-3)]">
                    {layer.name}
                  </span>
                  <span className="font-mono text-[14px] font-semibold text-[var(--assured-ink)] my-1 tabular">
                    {formatPercent(layer.rate * 100)}
                  </span>
                  <span className="text-[9px] text-[var(--ink-3)]">Clear</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--r-md)] shadow-[var(--e1)] flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-semibold text-[var(--ink)]">Active Fleet Governance Alerts</h4>
              <span className="text-[10px] font-semibold uppercase bg-[var(--escalate-bg)] text-[var(--escalate-ink)] border border-[var(--escalate-border)] px-1.5 py-0.5 rounded">
                3 Actionable
              </span>
            </div>

            <div className="divide-y divide-[var(--rule)]">
              {FLEET_ALERTS.map((alert) => (
                <div key={alert.id} className="py-2 flex items-start gap-2">
                  <span className="text-[13px] mt-0.5">
                    {alert.severity === 'critical' ? '🔴' : '🟡'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[12px] font-semibold text-[var(--ink)] truncate">
                        {alert.title}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ink-3)] shrink-0">
                        {alert.id}
                      </span>
                    </div>
                    <p className="text-[11px] leading-[15px] text-[var(--ink-3)] mt-0.5 line-clamp-2">
                      {alert.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
